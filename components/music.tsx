"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useContent } from "@/components/content-provider";
import { T } from "@/components/editable";
import { Section, SectionHead } from "@/components/section";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon } from "@/components/icons";

const BARS = 72;

// PaceBeat 채널의 "업로드 동영상" 재생목록입니다. 채널 ID(UC8iraw8fZe2S7_z5XhgA3ag,
// youtube.com/@pacebeatmusic 페이지에서 확인)의 앞 두 글자 UC 를 UU 로 바꾸면
// 유튜브가 자동으로 만들어주는 "이 채널의 모든 업로드" 재생목록 ID가 됩니다.
// 이 ID 하나로 채널에 새 영상이 올라와도 따로 손댈 필요 없이 계속 이어서 재생됩니다.
const PACEBEAT_UPLOADS_PLAYLIST = "UU8iraw8fZe2S7_z5XhgA3ag";

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

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const track = tracks[index] ?? tracks[0];
  const hasAudio = Boolean(track?.src);
  const bars = useMemo(() => waveform(track?.id ?? "seed"), [track?.id]);
  const total = toSeconds(track?.duration ?? "3:30");

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

      <div className="glass glass-top relative mx-auto grid max-w-[1000px] gap-5 rounded-2xl p-4 sm:gap-6 sm:p-6 md:grid-cols-[188px_1fr] lg:grid-cols-[188px_1fr_252px]">
        {/* 앨범아트 자리에 PaceBeat 채널의 실제 유튜브 영상을 넣습니다.
            채널에 올라온 순서대로 이어서 자동재생되고(재생목록 임베드),
            소리는 로컬 mp3 플레이어와 섞이지 않도록 그대로 유튜브 소리를 씁니다.
            브라우저 정책상 소리 있는 자동재생은 처음엔 막힐 수 있는데, 그 경우
            유튜브 자체 재생 버튼이 한 번 보였다가 눌러주면 이어서 재생됩니다. */}
        <div className="relative mx-auto aspect-square w-full max-w-[190px] overflow-hidden rounded-xl border border-line bg-white/3 md:mx-0 md:max-w-none">
          <iframe
            src={`https://www.youtube.com/embed/videoseries?list=${PACEBEAT_UPLOADS_PLAYLIST}&autoplay=1&rel=0`}
            title="PaceBeat 유튜브 채널 영상"
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* 파형 + 컨트롤 */}
        <div className="flex flex-col justify-between gap-5 sm:gap-6">
          <div>
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <T
                path={`tracks.${index}.title`}
                as="h3"
                className="text-lg font-semibold tracking-tight text-fg sm:text-xl md:text-2xl"
              />
              <span className="label shrink-0 rounded-full border border-line bg-white/4 px-2.5 py-1">
                {hasAudio ? "streaming" : "preview"}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
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

            <span className="label ml-auto tabular-nums">
              {elapsed} / {track?.duration}
            </span>
          </div>
        </div>

        {/* 플레이리스트 */}
        <div className="thin-scroll max-h-[260px] overflow-y-auto border-line pt-5 sm:max-h-[300px] sm:pt-6 lg:border-l lg:pt-0 lg:pl-6">
          <span className="label">playlist</span>
          <ul className="mt-4 flex flex-col gap-1">
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
