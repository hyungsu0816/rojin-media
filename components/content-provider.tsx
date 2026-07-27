"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { defaultContent, type SiteContent, type TextStyle, type SectionSpacing } from "@/content/site";
import { deepMerge, getPath, setPath } from "@/lib/path";

const STORAGE_KEY = "rojin-media:content";
const DISK_SYNC_DEBOUNCE_MS = 600;

type StoredEntry = { updatedAt: number; content: SiteContent };

type Ctx = {
  content: SiteContent;
  ready: boolean;
  editing: boolean;
  setEditing: (v: boolean) => void;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  getTextStyle: (path: string) => TextStyle;
  setTextStyle: (path: string, patch: Partial<TextStyle> | null) => void;
  getSectionSpacing: (key: string) => SectionSpacing;
  setSectionSpacing: (key: string, patch: Partial<SectionSpacing> | null) => void;
  save: () => void;
  reset: () => void;
  exportJson: () => void;
  importJson: (file: File) => void;
  dirty: boolean;
};

const ContentContext = createContext<Ctx | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const diskSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 아직 디스크에 반영되지 못한 최신 저장 요청. beforeunload 시 이걸 sendBeacon 으로 흘려보냅니다.
  const pendingSync = useRef<StoredEntry | null>(null);

  // localStorage 는 그 브라우저에만 남지만, 이 파일(site-data.json)에도 같이 써두면
  // 개발 서버가 켜져 있는 한 어떤 브라우저 · 탭에서 열어도 항상 같은 저장본이 보입니다.
  // 배포 환경(프로덕션)에서는 API 가 스스로 거부하니 조용히 무시됩니다.
  const syncToDisk = useCallback((entry: StoredEntry) => {
    fetch("/api/save-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    })
      .then(() => {
        if (pendingSync.current?.updatedAt === entry.updatedAt) pendingSync.current = null;
      })
      .catch(() => {
        // 네트워크 문제나 배포 환경이면 조용히 무시합니다 — localStorage 저장은 이미 끝났습니다.
      });
  }, []);

  const scheduleDiskSync = useCallback(
    (entry: StoredEntry) => {
      pendingSync.current = entry;
      if (diskSyncTimer.current) clearTimeout(diskSyncTimer.current);
      diskSyncTimer.current = setTimeout(() => syncToDisk(entry), DISK_SYNC_DEBOUNCE_MS);
    },
    [syncToDisk],
  );

  // 디바운스 타이머가 끝나기 전에 탭을 닫거나 새로고침하면 방금 한 편집이
  // 디스크에 반영되지 못한 채 사라지고, 다음 로드 때 옛날 디스크 내용이
  // 되살아나는 "롤백"처럼 보입니다. sendBeacon 은 페이지가 unload 되는
  // 순간에도 안정적으로 요청을 흘려보내므로 이 경우를 막아줍니다.
  useEffect(() => {
    const flush = () => {
      if (!pendingSync.current) return;
      const blob = new Blob([JSON.stringify(pendingSync.current)], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/save-content", blob);
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
    return () => {
      window.removeEventListener("beforeunload", flush);
    };
  }, []);

  // 저장된 수정본 불러오기 (하이드레이션 이후에만).
  // 우선순위: 기본값 < localStorage(이 브라우저) < 디스크 파일(개발 서버, 모든 브라우저 공통).
  useEffect(() => {
    let cancelled = false;

    async function load() {
      let local: StoredEntry | null = null;
      let disk: StoredEntry | null = null;

      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // 예전 형식(래퍼 없이 content 만 저장된 경우) 호환
          local =
            parsed && typeof parsed === "object" && "content" in parsed && "updatedAt" in parsed
              ? (parsed as StoredEntry)
              : { updatedAt: 0, content: parsed };
        }
      } catch {
        // 저장본이 깨졌으면 무시합니다.
      }

      try {
        const res = await fetch("/api/save-content", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.ok && data.content) {
            disk = { updatedAt: data.updatedAt ?? 0, content: data.content };
          }
        }
      } catch {
        // 배포 환경이거나 네트워크 문제면 localStorage 결과만 씁니다.
      }

      // 더 최근에 저장된 쪽을 그대로 씁니다 — 디스크가 항상 이기게 하면, 방금 한
      // 편집이 아직 디스크에 반영되지 못했을 때(디바운스 대기 중 새로고침 등)
      // 옛날 디스크 내용이 새 편집을 덮어써서 "롤백"된 것처럼 보이는 문제가 있었습니다.
      let winner: StoredEntry | null = null;
      if (local && disk) winner = disk.updatedAt >= local.updatedAt ? disk : local;
      else winner = disk ?? local;

      const merged = winner ? deepMerge(defaultContent, winner.content) : defaultContent;

      if (cancelled) return;
      setContent(merged);
      if (winner) setDirty(true);
      if (new URLSearchParams(window.location.search).get("edit") === "1") {
        setEditing(true);
      }
      setReady(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Ctrl + Alt + E 로 편집 모드 토글 (Alt+E 는 방문자가 실수로 누르기 쉬워 조합을 늘렸습니다)
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

  const persist = useCallback(
    (next: SiteContent) => {
      const entry: StoredEntry = { updatedAt: Date.now(), content: next };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
      } catch {
        // 저장 실패는 화면 동작을 막지 않습니다.
      }
      scheduleDiskSync(entry);
    },
    [scheduleDiskSync],
  );

  const set = useCallback(
    (path: string, value: any) => {
      setContent((prev) => {
        const next = setPath(prev, path, value);
        persist(next);
        return next;
      });
      setDirty(true);
    },
    [persist],
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
        persist(next);
        return next;
      });
      setDirty(true);
    },
    [persist],
  );

  const setSectionSpacing = useCallback(
    (key: string, patch: Partial<SectionSpacing> | null) => {
      setContent((prev) => {
        const nextSpacing = { ...(prev.sectionSpacing ?? {}) };
        if (patch === null) {
          delete nextSpacing[key];
        } else {
          nextSpacing[key] = { ...nextSpacing[key], ...patch };
        }
        const next = { ...prev, sectionSpacing: nextSpacing };
        persist(next);
        return next;
      });
      setDirty(true);
    },
    [persist],
  );

  // set() 이 이미 매 수정마다 저장하지만, 편집 바의 "저장" 버튼은
  // 사용자가 눈으로 확인할 수 있게 같은 동작을 명시적으로 한 번 더 하고,
  // 디스크 저장은 디바운스를 기다리지 않고 바로 보냅니다.
  const save = useCallback(() => {
    const entry: StoredEntry = { updatedAt: Date.now(), content };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
      setDirty(true);
    } catch {
      // 저장 실패는 화면 동작을 막지 않습니다.
    }
    if (diskSyncTimer.current) clearTimeout(diskSyncTimer.current);
    pendingSync.current = entry;
    syncToDisk(entry);
  }, [content, syncToDisk]);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setContent(defaultContent);
    setDirty(false);
  }, []);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rojin-media-content.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [content]);

  const importJson = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          const merged = deepMerge(defaultContent, parsed);
          setContent(merged);
          persist(merged);
          setDirty(true);
        } catch {
          window.alert("JSON을 읽지 못했습니다. 내보낸 파일이 맞는지 확인해 주세요.");
        }
      };
      reader.readAsText(file);
    },
    [persist],
  );

  const value = useMemo<Ctx>(
    () => ({
      content,
      ready,
      editing,
      setEditing,
      get: (path: string) => getPath(content, path),
      set,
      getTextStyle: (path: string) => content.textStyles?.[path] ?? {},
      setTextStyle,
      getSectionSpacing: (key: string) => content.sectionSpacing?.[key] ?? {},
      setSectionSpacing,
      save,
      reset,
      exportJson,
      importJson,
      dirty,
    }),
    [
      content,
      ready,
      editing,
      set,
      setTextStyle,
      setSectionSpacing,
      save,
      reset,
      exportJson,
      importJson,
      dirty,
    ],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
}
