"use client";

// ─────────────────────────────────────────────────────────────
// "목록 편집" 서랍에 들어갈 탭을 정의하는 예시입니다.
// example-content.ts 의 SiteContent 모양에 맞춰져 있으니,
// 실제 프로젝트에서는 여러분의 content 타입에 맞게 다시 씁니다.
// ─────────────────────────────────────────────────────────────

import { useContent } from "./content-provider";
import { Field, type EditorSection } from "./editor-bar";
import type { SiteContent } from "./example-content";

export function useEditorSections(): EditorSection[] {
  const { content } = useContent<SiteContent>();

  return [
    {
      id: "brand",
      label: "브랜드",
      render: () => (
        <div className="flex flex-col gap-3">
          <Field label="브랜드명" path="brand.name" />
          <Field label="이메일" path="brand.email" />
        </div>
      ),
    },
    {
      id: "projects",
      label: "프로젝트",
      render: () => (
        <>
          {content.projects.map((p, i) => (
            <div key={p.id} className="flex flex-col gap-3">
              <span className="font-mono text-[10px] tracking-wider text-white/40">
                {String(i + 1).padStart(2, "0")} — {p.title}
              </span>
              <Field label="이름" path={`projects.${i}.title`} />
              <Field label="설명" path={`projects.${i}.summary`} />
              <Field label="이미지 URL" path={`projects.${i}.image`} />
              <Field label="링크" path={`projects.${i}.href`} placeholder="https://..." />
              <div className="h-px bg-line" />
            </div>
          ))}
        </>
      ),
    },
  ];
}
