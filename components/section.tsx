"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useContent } from "@/components/content-provider";
import { T } from "@/components/editable";

const SPACING_MIN = -4;
const SPACING_MAX = 8;

function clampSpacing(n: number) {
  return Math.min(SPACING_MAX, Math.max(SPACING_MIN, Math.round(n * 4) / 4));
}

/** 편집 모드에서만 보이는, 섹션 위·아래 여백 조절 pill.
 * Section 이 아닌 곳(예: Hero)에서도 재사용할 수 있게 내보냅니다. */
export function SpacingControls({ sectionKey }: { sectionKey: string }) {
  const { getSectionSpacing, setSectionSpacing } = useContent();
  const spacing = getSectionSpacing(sectionKey);
  const top = spacing.top ?? 0;
  const bottom = spacing.bottom ?? 0;

  return (
    <div className="glass pointer-events-auto absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full px-1.5 py-1 text-dim">
      <span className="px-1.5 font-mono text-[9px] tracking-wider text-muted uppercase">위</span>
      <button
        type="button"
        title="위 여백 좁게"
        onClick={() => setSectionSpacing(sectionKey, { top: clampSpacing(top - 0.5) })}
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-white/8 hover:text-fg"
      >
        −
      </button>
      <span className="w-8 text-center font-mono text-[10px] tabular-nums">
        {top.toFixed(2)}
      </span>
      <button
        type="button"
        title="위 여백 넓게"
        onClick={() => setSectionSpacing(sectionKey, { top: clampSpacing(top + 0.5) })}
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-white/8 hover:text-fg"
      >
        +
      </button>

      <span className="mx-0.5 h-4 w-px bg-line" />

      <span className="px-1.5 font-mono text-[9px] tracking-wider text-muted uppercase">
        아래
      </span>
      <button
        type="button"
        title="아래 여백 좁게"
        onClick={() => setSectionSpacing(sectionKey, { bottom: clampSpacing(bottom - 0.5) })}
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-white/8 hover:text-fg"
      >
        −
      </button>
      <span className="w-8 text-center font-mono text-[10px] tabular-nums">
        {bottom.toFixed(2)}
      </span>
      <button
        type="button"
        title="아래 여백 넓게"
        onClick={() => setSectionSpacing(sectionKey, { bottom: clampSpacing(bottom + 0.5) })}
        className="flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-white/8 hover:text-fg"
      >
        +
      </button>

      {spacing.top || spacing.bottom ? (
        <>
          <span className="mx-0.5 h-4 w-px bg-line" />
          <button
            type="button"
            title="여백 초기화"
            onClick={() => setSectionSpacing(sectionKey, null)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-xs hover:bg-white/8 hover:text-fg"
          >
            ×
          </button>
        </>
      ) : null}
    </div>
  );
}

export function Section({
  id,
  sectionKey,
  children,
  className = "",
}: {
  id?: string;
  /** 여백 저장 키. 안 주면 id 를 씁니다 — 둘 다 없으면 여백 조절이 꺼집니다. */
  sectionKey?: string;
  children: ReactNode;
  className?: string;
}) {
  const { editing, getSectionSpacing } = useContent();
  const key = sectionKey ?? id;
  const spacing = key ? getSectionSpacing(key) : {};

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={`relative mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-6 sm:py-28 md:py-36 ${className}`}
      style={{
        ...(spacing.top ? { marginTop: `${spacing.top}rem` } : {}),
        ...(spacing.bottom ? { marginBottom: `${spacing.bottom}rem` } : {}),
      }}
    >
      {editing && key ? <SpacingControls sectionKey={key} /> : null}
      {children}
    </motion.section>
  );
}

export function SectionHead({
  eyebrowPath,
  titlePath,
  notePath,
}: {
  eyebrowPath: string;
  titlePath: string;
  notePath?: string;
}) {
  return (
    <header className="mb-12 flex flex-col items-center text-center sm:mb-16">
      <T path={eyebrowPath} className="label" />
      <T
        path={titlePath}
        as="h2"
        className="display mt-4 text-[clamp(28px,10.5vw,42px)] sm:mt-5 sm:text-[clamp(42px,5vw,52px)]"
      />
      {notePath ? (
        <T
          path={notePath}
          className="mt-4 max-w-[520px] text-[13px] leading-relaxed text-balance text-dim sm:text-sm"
        />
      ) : null}
    </header>
  );
}

/** 섹션 사이를 나누는 얇은 선. */
export function Rule() {
  return (
    <div className="mx-auto h-px w-full max-w-[1180px] bg-gradient-to-r from-transparent via-line to-transparent" />
  );
}
