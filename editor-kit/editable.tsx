"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useContent } from "./content-provider";
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "./icons";
import type { TextStyle } from "./types";

type Props = {
  /** 예: "hero.titleLine1", "projects.0.title" */
  path: string;
  as?: any;
  className?: string;
};

const SIZE_MIN = 0.6;
const SIZE_MAX = 2.2;
const LH_MIN = 1.0;
const LH_MAX = 2.6;
const MARGIN_MIN = -1;
const MARGIN_MAX = 4;

function clamp(n: number, min: number, max: number, precision = 10) {
  return Math.min(max, Math.max(min, Math.round(n * precision) / precision));
}

/** 포커스된 텍스트 위에 뜨는, 크기 · 행간 · 여백 · 정렬 미니 툴바. */
function StyleToolbar({
  anchor,
  style,
  onChange,
  onReset,
}: {
  anchor: HTMLElement;
  style: TextStyle;
  onChange: (patch: Partial<TextStyle>) => void;
  onReset: () => void;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const reposition = useCallback(() => {
    const rect = anchor.getBoundingClientRect();
    const barH = barRef.current?.offsetHeight ?? 40;
    const above = rect.top - barH - 10;
    setPos({
      top: above > 4 ? above : rect.bottom + 10,
      left: Math.max(8, rect.left),
    });
  }, [anchor]);

  useEffect(() => {
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [reposition]);

  // 글자 크기 · 행간 · 여백이 바뀌어 요소 높이가 달라지면 위치도 다시 잡습니다.
  useEffect(() => {
    reposition();
  }, [reposition, style.size, style.lineHeight, style.margin, style.align]);

  const size = style.size ?? 1;
  const lineHeight = style.lineHeight ?? 1.5;
  const margin = style.margin ?? 0;
  const align = style.align ?? "left";

  // 버튼을 눌러도 편집 중인 텍스트가 blur 되지 않게 막습니다.
  const keepFocus = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div
      ref={barRef}
      style={{ position: "fixed", top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
      className="glass z-[300] flex items-center gap-1 rounded-full px-1.5 py-1 text-dim"
      onMouseDown={keepFocus}
    >
      <button
        type="button"
        title="글자 작게"
        onClick={() => onChange({ size: clamp(size - 0.1, SIZE_MIN, SIZE_MAX) })}
        className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-white/8 hover:text-fg"
      >
        −
      </button>
      <span className="w-9 text-center font-mono text-[10px] tabular-nums">
        {size.toFixed(1)}×
      </span>
      <button
        type="button"
        title="글자 크게"
        onClick={() => onChange({ size: clamp(size + 0.1, SIZE_MIN, SIZE_MAX) })}
        className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-white/8 hover:text-fg"
      >
        +
      </button>

      <span className="mx-0.5 h-4 w-px bg-line" />

      <button
        type="button"
        title="행간 좁게"
        onClick={() => onChange({ lineHeight: clamp(lineHeight - 0.1, LH_MIN, LH_MAX) })}
        className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-white/8 hover:text-fg"
      >
        −
      </button>
      <span className="w-9 text-center font-mono text-[10px] tabular-nums">
        {lineHeight.toFixed(1)}
      </span>
      <button
        type="button"
        title="행간 넓게"
        onClick={() => onChange({ lineHeight: clamp(lineHeight + 0.1, LH_MIN, LH_MAX) })}
        className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-white/8 hover:text-fg"
      >
        +
      </button>

      <span className="mx-0.5 h-4 w-px bg-line" />

      <button
        type="button"
        title="여백 좁게"
        onClick={() => onChange({ margin: clamp(margin - 0.25, MARGIN_MIN, MARGIN_MAX, 4) })}
        className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-white/8 hover:text-fg"
      >
        −
      </button>
      <span className="w-9 text-center font-mono text-[10px] tabular-nums">
        {margin.toFixed(2)}
      </span>
      <button
        type="button"
        title="여백 넓게"
        onClick={() => onChange({ margin: clamp(margin + 0.25, MARGIN_MIN, MARGIN_MAX, 4) })}
        className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-white/8 hover:text-fg"
      >
        +
      </button>

      <span className="mx-0.5 h-4 w-px bg-line" />

      {(
        [
          ["left", AlignLeftIcon],
          ["center", AlignCenterIcon],
          ["right", AlignRightIcon],
        ] as const
      ).map(([val, Icon]) => (
        <button
          key={val}
          type="button"
          title={val}
          onClick={() => onChange({ align: val })}
          className={`flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/8 hover:text-fg ${
            align === val ? "bg-white/10 text-fg" : ""
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}

      <span className="mx-0.5 h-4 w-px bg-line" />

      <button
        type="button"
        title="스타일 초기화"
        onClick={onReset}
        className="flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-white/8 hover:text-fg"
      >
        ×
      </button>
    </div>
  );
}

/** 편집 모드에서 클릭하면 그 자리에서 고쳐지는 텍스트. */
export function T({ path, as: Tag = "span", className = "" }: Props) {
  const { get, set, editing, getTextStyle, setTextStyle } = useContent();
  const value = String(get(path) ?? "");
  const textStyle = getTextStyle(path);
  const ref = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement !== el && el.textContent !== value) {
      el.textContent = value;
    }
  }, [value, editing]);

  const styleProps: CSSProperties = {
    whiteSpace: "pre-wrap",
    ...(textStyle.size ? { fontSize: `${textStyle.size}em` } : {}),
    ...(textStyle.lineHeight ? { lineHeight: textStyle.lineHeight } : {}),
    ...(textStyle.margin
      ? { marginTop: `${textStyle.margin}em`, marginBottom: `${textStyle.margin}em` }
      : {}),
    ...(textStyle.align ? { textAlign: textStyle.align } : {}),
  };

  if (!editing) {
    return (
      <Tag className={className} style={styleProps}>
        {value}
      </Tag>
    );
  }

  return (
    <>
      <Tag
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        className={`${className} editable`}
        style={styleProps}
        onFocus={() => setFocused(true)}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key !== "Enter") return;
          if (!e.shiftKey) {
            // Enter 로 확정, Shift+Enter 로 줄바꿈
            e.preventDefault();
            (e.currentTarget as HTMLElement).blur();
            return;
          }
          e.preventDefault();
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return;
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const linebreak = document.createTextNode("\n");
          range.insertNode(linebreak);
          range.setStartAfter(linebreak);
          range.setEndAfter(linebreak);
          selection.removeAllRanges();
          selection.addRange(range);
        }}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          set(path, e.currentTarget.textContent ?? "");
          setFocused(false);
        }}
      />
      {focused && ref.current ? (
        <StyleToolbar
          anchor={ref.current}
          style={textStyle}
          onChange={(patch) => setTextStyle(path, patch)}
          onReset={() => setTextStyle(path, null)}
        />
      ) : null}
    </>
  );
}
