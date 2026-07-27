"use client";

import { useRef, useState } from "react";
import { useContent } from "@/components/content-provider";

type Tab = "brand" | "projects" | "tools" | "tracks";

function Field({
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

export function EditorBar() {
  const { editing, setEditing, content, save, dirty, exportJson, importJson, reset, ready } =
    useContent();
  const [tab, setTab] = useState<Tab>("projects");
  const [open, setOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!ready || !editing) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "brand", label: "브랜드" },
    { id: "projects", label: "프로젝트" },
    { id: "tools", label: "도구" },
    { id: "tracks", label: "트랙" },
  ];

  return (
    <>
      {/* 하단 바: 좁은 화면에서는 옆으로 스크롤합니다 */}
      <div className="thin-scroll fixed bottom-5 left-1/2 z-[200] flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border border-line bg-[rgba(16,16,18,0.92)] p-1.5 backdrop-blur-xl">
        <span className="flex shrink-0 items-center gap-2 px-3 font-mono text-[10px] whitespace-nowrap text-white/70 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          편집 중
        </span>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs whitespace-nowrap text-dim transition-colors hover:bg-white/8 hover:text-fg"
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
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
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
          className="shrink-0 rounded-full px-3 py-1.5 text-xs whitespace-nowrap text-dim transition-colors hover:bg-white/8 hover:text-fg"
        >
          JSON 내보내기
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs whitespace-nowrap text-dim transition-colors hover:bg-white/8 hover:text-fg"
        >
          불러오기
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("수정한 내용을 모두 지우고 기본값으로 되돌릴까요?")) reset();
          }}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs whitespace-nowrap text-dim transition-colors hover:bg-white/8 hover:text-fg"
        >
          초기화
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setEditing(false);
          }}
          className="shrink-0 rounded-full bg-fg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-ink"
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
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  tab === t.id ? "bg-white/10 text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {t.label}
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

          <div className="flex flex-col gap-7 p-4 pb-24">
            {tab === "brand" ? (
              <div className="flex flex-col gap-3">
                <Field label="브랜드명" path="brand.name" />
                <Field label="이메일" path="brand.email" />
                <Field
                  label="카카오채널 URL"
                  path="brand.kakaoUrl"
                  placeholder="https://pf.kakao.com/_xxxxx"
                />
                <Field label="유튜브 URL" path="brand.youtubeUrl" />
                <Field label="인스타그램 URL" path="brand.instagramUrl" />
                <Field label="위치" path="brand.location" />
              </div>
            ) : null}

            {tab === "projects"
              ? content.projects.map((p, i) => (
                  <div key={p.id} className="flex flex-col gap-3">
                    <span className="font-mono text-[10px] tracking-wider text-white/40">
                      {String(i + 1).padStart(2, "0")} — {p.title}
                    </span>
                    <Field label="이름" path={`projects.${i}.title`} />
                    <Field label="분류" path={`projects.${i}.kind`} />
                    <Field label="연도" path={`projects.${i}.year`} />
                    <Field label="한 줄 설명" path={`projects.${i}.summary`} />
                    <Field label="역할" path={`projects.${i}.role`} />
                    <Field
                      label="이미지 URL"
                      path={`projects.${i}.image`}
                      placeholder="/works/pacebeat.jpg"
                    />
                    <Field
                      label="링크"
                      path={`projects.${i}.href`}
                      placeholder="https://..."
                    />
                    <div className="h-px bg-line" />
                  </div>
                ))
              : null}

            {tab === "tools"
              ? content.tools.map((t, i) => (
                  <div key={t.id} className="flex flex-col gap-3">
                    <Field label="도구 이름" path={`tools.${i}.name`} />
                    <Field label="하는 일" path={`tools.${i}.role`} />
                    <Field
                      label="연결할 프로젝트 id"
                      path={`tools.${i}.projectId`}
                      placeholder={content.projects.map((p) => p.id).join(" / ")}
                    />
                    <div className="h-px bg-line" />
                  </div>
                ))
              : null}

            {tab === "tracks"
              ? content.tracks.map((t, i) => (
                  <div key={t.id} className="flex flex-col gap-3">
                    <Field label="트랙명" path={`tracks.${i}.title`} />
                    <Field label="프로젝트" path={`tracks.${i}.project`} />
                    <Field label="BPM" path={`tracks.${i}.bpm`} />
                    <Field label="길이 (m:ss)" path={`tracks.${i}.duration`} />
                    <Field
                      label="음원 파일 경로"
                      path={`tracks.${i}.src`}
                      placeholder="/audio/track01.mp3"
                    />
                    <Field label="커버 이미지" path={`tracks.${i}.cover`} />
                    <div className="h-px bg-line" />
                  </div>
                ))
              : null}
          </div>
        </aside>
      ) : null}
    </>
  );
}
