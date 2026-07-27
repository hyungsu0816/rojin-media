"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "@/components/content-provider";
import { T } from "@/components/editable";
import { Section, SectionHead } from "@/components/section";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon } from "@/components/icons";

const BARS = 72;

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

      <div className="glass glass-top relative mx-auto grid max-w-[1000px] gap-6 rounded-2xl p-6 md:grid-cols-[188px_1fr] lg:grid-cols-[188px_1fr_252px]">
        {/* 앨범아트 */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-line bg-white/3">
          <AnimatePresence mode="wait">
            {track?.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <motion.img
                key={track.id}
                src={track.cover}
                alt={track.title}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <motion.div
                key={`ph-${track?.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-1"
              >
                <span className="font-mono text-4xl tracking-tight text-white/20">
                  {track?.bpm ?? "—"}
                </span>
                <span className="label">bpm</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 파형 + 컨트롤 */}
        <div className="flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <T
                path={`tracks.${index}.title`}
                as="h3"
                className="text-xl font-semibold tracking-tight text-fg md:text-2xl"
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
            className="flex h-24 cursor-pointer items-center gap-[1px] sm:gap-[3px]"
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

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="이전 트랙"
              className="text-dim transition-colors hover:text-fg"
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
              className="text-dim transition-colors hover:text-fg"
            >
              <NextIcon className="h-4 w-4" />
            </button>

            <span className="label ml-auto tabular-nums">
              {elapsed} / {track?.duration}
            </span>
          </div>
        </div>

        {/* 플레이리스트 */}
        <div className="thin-scroll max-h-[300px] overflow-y-auto border-line pt-6 lg:border-l lg:pt-0 lg:pl-6">
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
