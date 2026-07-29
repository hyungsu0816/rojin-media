"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Ctx = {
  muted: boolean;
  registerIframe: (el: HTMLIFrameElement | null) => void;
  toggle: () => void;
};

const YoutubeMuteContext = createContext<Ctx | null>(null);

/** 배경에서 자동재생되는 유튜브 소리를 사이트 전체에서 한 곳으로 켜고 끕니다.
 * 처음엔 안전하게 음소거로 시작하고(방문자가 예상 못한 소리에 놀라지 않도록),
 * 우측 하단 플로팅 버튼으로 언제든 켤 수 있습니다.
 *
 * iframe 의 src 를 바꿔서 음소거하면 영상이 처음부터 다시 로드되므로, 대신
 * 유튜브 IFrame API 의 postMessage 명령(mute/unMute)으로 재생 중인 영상 그대로
 * 소리만 켜고 끕니다. 영상을 바꿔서 iframe 이 새로 마운트되면(항상 무음으로 시작)
 * 마운트 이후 "onReady" 메시지를 받는 순간 지금의 음소거 상태를 다시 맞춰줍니다. */
export function YoutubeMuteProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const postCommand = useCallback((func: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "https://www.youtube.com",
    );
  }, []);

  const registerIframe = useCallback((el: HTMLIFrameElement | null) => {
    iframeRef.current = el;
  }, []);

  const toggle = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      postCommand(next ? "mute" : "unMute");
      return next;
    });
  }, [postCommand]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://www.youtube.com") return;
      if (e.source !== iframeRef.current?.contentWindow) return;
      let data: unknown;
      try {
        data = JSON.parse(e.data);
      } catch {
        return;
      }
      const event = (data as { event?: string })?.event;
      if (event === "onReady" && !muted) postCommand("unMute");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [muted, postCommand]);

  return (
    <YoutubeMuteContext.Provider value={{ muted, registerIframe, toggle }}>
      {children}
    </YoutubeMuteContext.Provider>
  );
}

export function useYoutubeMute() {
  const ctx = useContext(YoutubeMuteContext);
  if (!ctx) throw new Error("useYoutubeMute must be used inside YoutubeMuteProvider");
  return ctx;
}

function VolumeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 9.5v5h3.4L13 19V5L7.4 9.5H4z" fill="currentColor" stroke="none" />
      <path d="M16.3 8.3a4.5 4.5 0 0 1 0 7.4" />
      <path d="M18.4 5.8a8 8 0 0 1 0 12.4" />
    </svg>
  );
}

function MuteIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 9.5v5h3.4L13 19V5L7.4 9.5H4z" fill="currentColor" stroke="none" />
      <path d="M16.5 9.5 21 14M21 9.5l-4.5 4.5" />
    </svg>
  );
}

/** 화면 어디로 스크롤해도 항상 같은 자리에 떠 있는 소리 켜기/끄기 버튼.
 * position: fixed 는 조상 엘리먼트에 transform 이 걸려 있으면 뷰포트가 아니라
 * 그 조상 기준으로 고정돼버립니다(Section 의 등장 애니메이션이 transform 을 씁니다).
 * 그래서 이 컴포넌트는 그런 애니메이션 트리 밖, app/page.tsx 최상단에서 렌더링합니다. */
export function YoutubeMuteFloatingButton() {
  const { muted, toggle } = useYoutubeMute();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "유튜브 소리 켜기" : "유튜브 소리 끄기"}
      className="glass fixed right-4 bottom-6 z-[95] flex h-12 w-12 items-center justify-center rounded-full border border-line text-fg shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-transform duration-300 hover:scale-105 sm:right-6 sm:bottom-8"
    >
      {muted ? <MuteIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
    </button>
  );
}
