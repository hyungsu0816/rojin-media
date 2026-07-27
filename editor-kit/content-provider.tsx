"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { deepMerge, getPath, setPath } from "./lib/path";
import type { EditableContent, TextStyle } from "./types";

type Ctx<T> = {
  content: T;
  ready: boolean;
  editing: boolean;
  setEditing: (v: boolean) => void;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  getTextStyle: (path: string) => TextStyle;
  setTextStyle: (path: string, patch: Partial<TextStyle> | null) => void;
  save: () => void;
  reset: () => void;
  exportJson: () => void;
  importJson: (file: File) => void;
  dirty: boolean;
};

const ContentContext = createContext<Ctx<any> | null>(null);

export function ContentProvider<T extends EditableContent>({
  children,
  defaultContent,
  storageKey,
  exportFileName = "content.json",
}: {
  children: ReactNode;
  /** 프로젝트마다 다른 콘텐츠 기본값. content/site.ts 같은 파일에서 옮겨 옵니다. */
  defaultContent: T;
  /** localStorage 키. 프로젝트마다 겹치지 않게 다른 문자열을 씁니다. */
  storageKey: string;
  /** "JSON 내보내기" 버튼이 저장할 파일명. */
  exportFileName?: string;
}) {
  const [content, setContent] = useState<T>(defaultContent);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);

  // 저장된 수정본 불러오기 (하이드레이션 이후에만)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        setContent(deepMerge(defaultContent, JSON.parse(raw)));
        setDirty(true);
      }
    } catch {
      // 저장본이 깨졌으면 기본값으로 둡니다.
    }
    if (new URLSearchParams(window.location.search).get("edit") === "1") {
      setEditing(true);
    }
    setReady(true);
    // defaultContent 는 매 렌더 새 객체일 수 있어 최초 1회만 돕니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ctrl + Alt + E 로 편집 모드 토글 (Alt+E 만 쓰면 방문자가 실수로 누르기 쉽습니다)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === "e" || e.key === "E" || e.code === "KeyE")) {
        e.preventDefault();
        setEditing((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const set = useCallback(
    (path: string, value: any) => {
      setContent((prev) => {
        const next = setPath(prev, path, value);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // 저장 실패는 화면 동작을 막지 않습니다.
        }
        return next;
      });
      setDirty(true);
    },
    [storageKey],
  );

  const setTextStyle = useCallback(
    (path: string, patch: Partial<TextStyle> | null) => {
      setContent((prev) => {
        const nextStyles = { ...(prev.textStyles ?? {}) };
        if (patch === null) {
          delete nextStyles[path];
        } else {
          nextStyles[path] = { ...nextStyles[path], ...patch };
        }
        const next = { ...prev, textStyles: nextStyles };
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // 저장 실패는 화면 동작을 막지 않습니다.
        }
        return next;
      });
      setDirty(true);
    },
    [storageKey],
  );

  // set() 이 이미 매 수정마다 저장하지만, 편집 바의 "저장" 버튼은
  // 사용자가 눈으로 확인할 수 있게 같은 동작을 명시적으로 한 번 더 합니다.
  const save = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(content));
      setDirty(true);
    } catch {
      // 저장 실패는 화면 동작을 막지 않습니다.
    }
  }, [content, storageKey]);

  const reset = useCallback(() => {
    window.localStorage.removeItem(storageKey);
    setContent(defaultContent);
    setDirty(false);
  }, [defaultContent, storageKey]);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [content, exportFileName]);

  const importJson = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          const merged = deepMerge(defaultContent, parsed);
          window.localStorage.setItem(storageKey, JSON.stringify(merged));
          setContent(merged);
          setDirty(true);
        } catch {
          window.alert("JSON을 읽지 못했습니다. 내보낸 파일이 맞는지 확인해 주세요.");
        }
      };
      reader.readAsText(file);
    },
    [defaultContent, storageKey],
  );

  const value = useMemo<Ctx<T>>(
    () => ({
      content,
      ready,
      editing,
      setEditing,
      get: (path: string) => getPath(content, path),
      set,
      getTextStyle: (path: string) => content.textStyles?.[path] ?? {},
      setTextStyle,
      save,
      reset,
      exportJson,
      importJson,
      dirty,
    }),
    [content, ready, editing, set, setTextStyle, save, reset, exportJson, importJson, dirty],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent<T extends EditableContent = EditableContent>() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx as Ctx<T>;
}
