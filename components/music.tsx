"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "@/components/content-provider";
import { T } from "@/components/editable";
import { Section, SectionHead } from "@/components/section";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon } from "@/components/icons";
import { useYoutubeMute } from "@/components/youtube-mute";

const BARS = 72;

// 예전에는 채널 ID 의 UC 를 UU 로 바꾼 "업로드 전체" 재생목록(list=UU...)으로
// 자동재생했는데, 이 재생목록은 유튜브가 실시간으로 관리하는 값이라 그중 한
// 영상이라도 임베드가 막혀 있으면("이 동영상은 볼 수 없습니다") 화면이 그대로
// 멈춰버립니다. 그래서 지금은 직접 확인한 목록(content.fromyVideos/youtubeVideos)의
// 첫 영상부터 우리가 순서를 관리하며 재생하고, 재생이 끝나거나 에러가 나면
// 다음 영상으로 자동으로 넘어갑니다.

type ListTab = "fromy" | "pacebeat" | "playlist";

/** 트랙마다 같은 모양이 나오도록, 제목에서 파형을 만듭니다. */
function waveform(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out: number[] = [];
  for (let i = 0; i < BARS; i += 1) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    h |= 0;
    const r = Math.abs(h % 1000) / 1000;
    const envelope = 0.4 + 0.6 * Math.sin((i / BARS) * Math.PI);
    out.push(0.16 + r * 0.84 * envelope);
  }
  return out;
}

function toSeconds(mmss: string) {
  const [m, s] = mmss.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(m)) return 210;
  return m * 60 + (Number.isNaN(s) ? 0 : s);
}

function format(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function Music() {
  const { content } = useContent();
  const tracks = content.tracks;
  const pacebeatVideos = content.youtubeVideos ?? [];
  const fromyVideos = content.fromyVideos ?? [];

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  // 위쪽 화면과 아래쪽 목록을 fromy / pacebeat / 로컬 재생목록 세 갈래로 나눠서
  // 같은 카드 안에서 탭으로 오갈 수 있게 합니다.
  const [listTab, setListTab] = useState<ListTab>("fromy");
  // playlist 탭으로 가도 화면은 마지막으로 보던 채널을 계속 보여줘야 하므로,
  // "지금 보고 있는 채널"은 listTab 과 별개로 기억해둡니다.
  const [activeChannel, setActiveChannel] = useState<"fromy" | "pacebeat">("fromy");
  // 지금 화면에서 재생 중인 영상. 채널 탭을 고르면 그 채널의 첫 영상으로 시작해서,
  // 끝나거나 에러가 나면 아래 목록 순서대로 다음 영상으로 자동으로 넘어갑니다.
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(
    () => fromyVideos[0]?.videoId ?? null,
  );

  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const track = tracks[index] ?? tracks[0];
  const hasAudio = Boolean(track?.src);
  const bars = useMemo(() => waveform(track?.id ?? "seed"), [track?.id]);
  const total = toSeconds(track?.duration ?? "3:30");

  const activeList = activeChannel === "fromy" ? fromyVideos : pacebeatVideos;

  // 항상 mute=1 로 시작합니다 — 실제 소리 켜짐 여부는 YoutubeMuteProvider 가
  // postMessage 로 따로 제어합니다(주석은 youtube-mute.tsx 참고).
  const youtubeSrc = selectedVideoId
    ? `https://www.youtube.com/embed/${selectedVideoId}?autoplay=1&mute=1&enablejsapi=1&rel=0`
    : "";

  const { registerIframe } = useYoutubeMute();

  const setIframeRef = useCallback(
    (el: HTMLIFrameElement | null) => {
      iframeRef.current = el;
      registerIframe(el);
    },
    [registerIframe],
  );

  const selectChannelTab = (channel: "fromy" | "pacebeat") => {
    setListTab(channel);
    setActiveChannel(channel);
    const list = channel === "fromy" ? fromyVideos : pacebeatVideos;
    setSelectedVideoId(list[0]?.videoId ?? null);
    // PLAYLIST 탭에서 로컬 mp3 를 재생해두고 유튜브 탭으로 넘어가면 소리가 겹치므로 멈춥니다.
    setPlaying(false);
  };

  // 지금 보이는 영상이 재생 끝(state 0)이거나 재생 불가(onError) 상태가 되면
  // 같은 채널 목록에서 다음 영상으로 자동으로 넘어갑니다 — 유튜브의 실시간
  // "업로드 전체" 재생목록 대신 우리가 확인한 목록 안에서만 순환하므로,
  // 임베드가 막힌 영상 하나 때문에 화면이 멈추는 일이 없습니다.
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
      const parsed = data as { event?: string; info?: number };
      const ended = parsed.event === "onStateChange" && parsed.info === 0;
      const errored = parsed.event === "onError";
      if (!ended && !errored) return;

      setSelectedVideoId((current) => {
        const i = activeList.findIndex((v) => v.videoId === current);
        if (activeList.length === 0) return current;
        const nextIndex = i === -1 ? 0 : (i + 1) % activeList.length;
        return activeList[nextIndex].videoId;
      });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [activeList]);

  const go = useCallback(
    (dir: number) => {
      setIndex((prev) => (prev + dir + tracks.length) % tracks.length);
      setProgress(0);
    },
    [tracks.length],
  );

  // 음원이 없을 때도 컨트롤이 살아 있도록, 길이 기준으로 진행을 흉내 냅니다.
  useEffect(() => {
    if (!playing || hasAudio) return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        const next = p + 0.25 / total;
        if (next >= 1) {
          go(1);
          return 0;
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, hasAudio, total, go]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !hasAudio) return;
    if (playing) {
      el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, [playing, hasAudio, index]);

  const seek = (ratio: number) => {
    const clamped = Math.max(0, Math.min(1, ratio));
    setProgress(clamped);
    const el = audioRef.current;
    if (el && hasAudio && el.duration) el.currentTime = clamped * el.duration;
  };

  const elapsed = format(progress * total);

  return (
    <Section id="music">
      <SectionHead eyebrowPath="music.eyebrow" titlePath="music.title" notePath="music.note" />

      <div className="glass glass-top relative mx-auto flex max-w-[720px] flex-col gap-5 rounded-2xl p-4 sm:gap-6 sm:p-6">
        {/* PLAYLIST 탭에서는 유튜브 영상 대신 지금 고른 로컬 트랙의 커버 이미지를
            같은 크기(16:9) 박스에 보여줍니다 — iframe 이 언마운트되니 유튜브 영상도
            자연스럽게 멈춥니다. fromy/pacebeat 탭에서는 실제로 재생되는 유튜브 영상입니다.
            채널 탭을 고르면 그 채널의 목록 순서대로 재생하고, 하나를 직접 고르면
            그 영상부터 이어집니다. 영상이 끝나거나(재생 불가 포함) 목록의 다음
            영상으로 자동으로 넘어갑니다. 브라우저 정책상 소리 있는 자동재생은
            처음엔 막힐 수 있는데, 그 경우 유튜브 자체 재생 버튼이 한 번 보였다가
            눌러주면 이어서 재생됩니다. */}
        <div className="text-center">
          <span className="label">
            {listTab === "playlist"
              ? `${track?.project ?? ""} · TRACK`
              : `${activeChannel.toUpperCase()} · YOUTUBE`}
          </span>
          <div
            className="relative mt-3 w-full overflow-hidden rounded-xl border border-line bg-white/3"
            style={{ aspectRatio: "16 / 9" }}
          >
            {listTab === "playlist" ? (
              track?.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={track.cover}
                  alt={track.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  <span className="font-mono text-4xl tracking-tight text-white/20">
                    {track?.bpm ?? "—"}
                  </span>
                  <span className="label">bpm</span>
                </div>
              )
            ) : youtubeSrc ? (
              <iframe
                key={youtubeSrc}
                ref={setIframeRef}
                src={youtubeSrc}
                title={`${activeChannel} 유튜브 채널 영상`}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            ) : null}
          </div>
        </div>

        {/* 로컬 mp3 트랙 정보 + 파형 + 컨트롤은 PLAYLIST 탭일 때만 보여줍니다.
            YOUTUBE 탭에서는 로컬 재생과 무관한 정보라 숨겨둡니다(재생 자체는 백그라운드에서 계속됩니다). */}
        {listTab === "playlist" ? (
          <>
            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <T
                  path={`tracks.${index}.title`}
                  as="h3"
                  className="text-lg font-semibold tracking-tight text-fg sm:text-xl md:text-2xl"
                />
                <span className="label shrink-0 rounded-full border border-line bg-white/4 px-2.5 py-1">
                  {hasAudio ? "streaming" : "preview"}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-center gap-2">
                <T path={`tracks.${index}.project`} className="label" />
                <span className="text-white/20">·</span>
                <span className="label">{track?.bpm} BPM</span>
              </div>
            </div>

            {/* 파형 */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="재생 위치"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek((e.clientX - rect.left) / rect.width);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") seek(progress + 0.05);
                if (e.key === "ArrowLeft") seek(progress - 0.05);
              }}
              className="flex h-16 cursor-pointer items-center gap-[1px] sm:h-24 sm:gap-[3px]"
            >
              {bars.map((h, i) => {
                const played = i / BARS <= progress;
                return (
                  <span
                    key={i}
                    className={`flex-1 rounded-full transition-[height,background-color] duration-300 ${
                      played ? "bg-white/85" : "bg-white/16"
                    } ${playing ? "bar-pulse" : ""}`}
                    style={{
                      height: `${Math.round(h * 100)}%`,
                      animationDelay: playing ? `${(i % 14) * 0.07}s` : undefined,
                    }}
                  />
                );
              })}
            </div>

            {/* 이전/다음 버튼은 아이콘이 16px 이라 그대로 두면 모바일에서 누르기 어렵습니다.
                -m-2 p-2 로 보이는 크기는 그대로 두고 누를 수 있는 영역만 넓힙니다. */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="이전 트랙"
                  className="-m-2 p-2 text-dim transition-colors hover:text-fg"
                >
                  <PrevIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? "일시정지" : "재생"}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-fg text-ink transition-transform duration-300 hover:scale-105"
                >
                  {playing ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="ml-0.5 h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="다음 트랙"
                  className="-m-2 p-2 text-dim transition-colors hover:text-fg"
                >
                  <NextIcon className="h-4 w-4" />
                </button>
              </div>

              <span className="label tabular-nums">
                {elapsed} / {track?.duration}
              </span>
            </div>
          </>
        ) : null}

        {/* fromy / pacebeat 유튜브 목록 / 로컬 재생목록 — 같은 자리에서 탭으로 오갑니다.
            위 화면은 실제로 작동하는 유튜브 플레이어, 아래는 세 종류의 카탈로그입니다. */}
        <div className="border-t border-line pt-5">
          <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-line bg-white/3 p-1">
            <button
              type="button"
              onClick={() => selectChannelTab("fromy")}
              className={`label rounded-full px-3 py-1.5 transition-colors ${
                listTab === "fromy" ? "bg-fg text-ink" : "text-dim hover:text-fg"
              }`}
            >
              FROMY
            </button>
            <button
              type="button"
              onClick={() => selectChannelTab("pacebeat")}
              className={`label rounded-full px-3 py-1.5 transition-colors ${
                listTab === "pacebeat" ? "bg-fg text-ink" : "text-dim hover:text-fg"
              }`}
            >
              PACEBEAT
            </button>
            <button
              type="button"
              onClick={() => setListTab("playlist")}
              className={`label rounded-full px-3 py-1.5 transition-colors ${
                listTab === "playlist" ? "bg-fg text-ink" : "text-dim hover:text-fg"
              }`}
            >
              PLAYLIST
            </button>
          </div>

          {listTab === "fromy" || listTab === "pacebeat" ? (
            <ul className="thin-scroll mt-4 grid max-h-[300px] grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-3">
              {(listTab === "fromy" ? fromyVideos : pacebeatVideos).map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedVideoId(v.videoId)}
                    className={`group block w-full text-left ${
                      selectedVideoId === v.videoId ? "opacity-100" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span
                      className={`relative block aspect-video overflow-hidden rounded-md border bg-white/3 ${
                        selectedVideoId === v.videoId ? "border-white/50" : "border-line"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={v.thumb}
                        alt={v.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </span>
                    <span className="mt-1.5 block line-clamp-2 text-[11.5px] leading-snug text-dim">
                      {v.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="thin-scroll mt-4 flex max-h-[300px] flex-col gap-1 overflow-y-auto pr-1">
              {tracks.map((t, i) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setIndex(i);
                      setProgress(0);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      i === index ? "bg-white/8" : "hover:bg-white/4"
                    }`}
                  >
                    <span className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-line bg-white/3">
                      {t.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.cover}
                          alt=""
                          className={`h-full w-full object-cover transition-all duration-500 ${
                            i === index ? "opacity-100 grayscale-0" : "opacity-70 grayscale"
                          }`}
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[13px] ${
                          i === index ? "text-fg" : "text-dim"
                        }`}
                      >
                        {t.title}
                      </span>
                      <span className="label block">{t.project}</span>
                    </span>
                    <span className="label shrink-0">{t.duration}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasAudio ? (
          <audio
            ref={audioRef}
            src={track.src}
            preload="none"
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              if (el.duration) setProgress(el.currentTime / el.duration);
            }}
            onEnded={() => go(1)}
          />
        ) : null}
      </div>
    </Section>
  );
}
