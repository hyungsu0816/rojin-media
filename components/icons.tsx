import type { CSSProperties } from "react";

/**
 * 도구를 나타내는 기하학 아이콘.
 * 외부 브랜드 로고를 그대로 쓰지 않고, 각 도구가 하는 일의 모양을 씁니다.
 */
export function ToolGlyph({
  id,
  className = "",
  style,
}: {
  id: string;
  className?: string;
  style?: CSSProperties;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style,
  };

  switch (id) {
    case "claude": // 겹친 레이어 = 설계
      return (
        <svg {...common}>
          <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
          <path d="M3 12.5 12 17l9-4.5" opacity="0.55" />
          <path d="M3 17.5 12 22l9-4.5" opacity="0.3" />
        </svg>
      );
    case "chatgpt": // 대화 = 카피
      return (
        <svg {...common}>
          <path d="M4 5.5h16v10H9.5L4 19V5.5Z" />
          <path d="M8 9.5h8M8 12.5h5" opacity="0.55" />
        </svg>
      );
    case "canva": // 프레임 = 그래픽
      return (
        <svg {...common}>
          <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
          <path d="m3.5 15 4.5-4 4 3.5 3.5-3 5 4.5" opacity="0.6" />
          <circle cx="9" cy="9" r="1.4" />
        </svg>
      );
    case "gemini": // 겹친 스파클 = 리서치·아이디어
      return (
        <svg {...common}>
          <path d="M12 3c0 4-2.5 6.5-6.5 6.5C9.5 9.5 12 12 12 16c0-4 2.5-6.5 6.5-6.5C14.5 9.5 12 7 12 3Z" />
          <path d="M4.5 17.5c0 1.6-1 2.5-2.5 2.5 1.5 0 2.5 1 2.5 2.5 0-1.5 1-2.5 2.5-2.5-1.5 0-2.5-.9-2.5-2.5Z" opacity="0.5" />
        </svg>
      );
    case "suno": // 파형 = 음악
      return (
        <svg {...common}>
          <path d="M3 12h2M7.5 7.5v9M12 4v16M16.5 8.5v7M21 11v2" />
        </svg>
      );
    case "capcut": // 타임라인 = 편집
      return (
        <svg {...common}>
          <rect x="3.5" y="6" width="17" height="5" rx="1.2" />
          <rect x="3.5" y="13" width="11" height="5" rx="1.2" opacity="0.55" />
          <path d="M17 3v18" opacity="0.8" />
        </svg>
      );
    case "nextjs": // 꺾쇠 = 구현
      return (
        <svg {...common}>
          <path d="m9 8-5 4 5 4M15 8l5 4-5 4" />
          <path d="M13.5 5 10.5 19" opacity="0.5" />
        </svg>
      );
    case "github": // 분기 = 버전
      return (
        <svg {...common}>
          <circle cx="7" cy="6" r="2.2" />
          <circle cx="7" cy="18" r="2.2" />
          <circle cx="17" cy="10" r="2.2" />
          <path d="M7 8.2v7.6M7 12h5.5a2.5 2.5 0 0 0 2.5-2.5" opacity="0.6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7.5" />
        </svg>
      );
  }
}

export function AlignLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
    >
      <path d="M4 6h16M4 12h10M4 18h13" />
    </svg>
  );
}

export function AlignCenterIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
    >
      <path d="M4 6h16M7 12h10M5.5 18h13" />
    </svg>
  );
}

export function AlignRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
    >
      <path d="M4 6h16M10 12h10M7 18h13" />
    </svg>
  );
}

export function ScrollMouseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="8" y="3" width="8" height="14" rx="4" />
      <circle cx="12" cy="7.5" r="1.1" fill="currentColor" stroke="none" className="scroll-wheel" />
    </svg>
  );
}

export function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function PauseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7 5h3.2v14H7zM13.8 5H17v14h-3.2z" />
    </svg>
  );
}

export function PrevIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7 6h2v12H7zm11 0-9 6 9 6V6z" />
    </svg>
  );
}

export function NextIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M15 6h2v12h-2zM6 6l9 6-9 6V6z" />
    </svg>
  );
}
