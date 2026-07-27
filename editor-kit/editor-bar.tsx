"use client";

import { useRef, useState, type ReactNode } from "react";
import { useContent } from "./content-provider";

/** 목록 편집 서랍 안에서 쓰는 한 줄짜리 입력 필드.
 * 각 프로젝트의 탭 내용을 만들 때 이걸로 조립합니다. */
export function Field({
  label,
  path,
  placeholder,
}: {
  label: string;
  path: string;
  placeholder?: string;
}) {
  const { get, set } = useContent();
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] tracking-wider text-muted uppercase">
        {label}
      </span>
      <input
        value={String(get(path) ?? "")}
        placeholder={placeholder}
        onChange={(e) => set(path, e.target.value)}
        className="rounded-md border border-line bg-white/4 px-2.5 py-2 text-[13px] text-fg outline-none placeholder:text-white/25 focus:border-white/40"
      />
    </label>
  );
}

export type EditorSection = {
  id: string;
  label: string;
  /** 탭을 눌렀을 때 서랍에 그릴 내용. <Field> 를 조합해서 만듭니다. */
  render: () => ReactNode;
};

/** 편집 모드 하단 바 + "목록 편집" 서랍.
 * 탭 구성(sections)은 프로젝트마다 다르므로 바깥에서 넘겨받습니다 —
 * 이 컴포넌트 자체(버튼들, 저장/내보내기/불러오기/초기화 동작)는 그대로 재사용합니다. */
export function EditorBar({ sections }: { sections: EditorSection[] }) {
  const { editing, setEditing, save, dirty, exportJson, importJson, reset, ready } =
    useContent();
  const [tabId, setTabId] = useState(sections[0]?.id);
  const [open, setOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!ready || !editing) return null;

  const activeSection = sections.find((s) => s.id === tabId) ?? sections[0];

  return (
    <>
      {/* 하단 바 */}
      <div className="fixed bottom-5 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-[rgba(16,16,18,0.92)] p-1.5 backdrop-blur-xl">
        <span className="flex items-center gap-2 px-3 font-mono text-[10px] tracking-wider text-white/70 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          편집 중
        </span>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full px-3 py-1.5 text-xs text-dim transition-colors hover:bg-white/8 hover:text-fg"
        >
          목록 편집
        </button>
        <button
          type="button"
          onClick={() => {
            save();
            setJustSaved(true);
            window.setTimeout(() => setJustSaved(false), 1500);
          }}
          className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
            justSaved
              ? "text-fg"
              : dirty
                ? "text-fg hover:bg-white/8"
                : "text-dim hover:bg-white/8 hover:text-fg"
          }`}
        >
          {justSaved ? "저장됨 ✓" : "저장"}
        </button>
        <button
          type="button"
          onClick={exportJson}
          className="rounded-full px-3 py-1.5 text-xs text-dim transition-colors hover:bg-white/8 hover:text-fg"
        >
          JSON 내보내기
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-full px-3 py-1.5 text-xs text-dim transition-colors hover:bg-white/8 hover:text-fg"
        >
          불러오기
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("수정한 내용을 모두 지우고 기본값으로 되돌릴까요?")) reset();
          }}
          className="rounded-full px-3 py-1.5 text-xs text-dim transition-colors hover:bg-white/8 hover:text-fg"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setEditing(false);
          }}
          className="rounded-full bg-fg px-3.5 py-1.5 text-xs font-medium text-ink"
        >
          완료
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importJson(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* 목록 편집 서랍 */}
      {open ? (
        <aside className="thin-scroll fixed top-0 right-0 z-[200] h-full w-full max-w-[380px] overflow-y-auto border-l border-line bg-[rgba(12,12,14,0.96)] backdrop-blur-xl">
          <div className="sticky top-0 flex items-center gap-1 border-b border-line bg-[rgba(12,12,14,0.96)] px-4 py-3">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setTabId(s.id)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  activeSection?.id === s.id ? "bg-white/10 text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {s.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto px-2 text-lg leading-none text-muted hover:text-fg"
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col gap-7 p-4 pb-24">{activeSection?.render()}</div>
        </aside>
      ) : null}
    </>
  );
}
