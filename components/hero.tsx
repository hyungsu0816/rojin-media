"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useRef, type CSSProperties } from "react";
import { useContent } from "@/components/content-provider";
import { T } from "@/components/editable";
import { ArrowRight, ScrollMouseIcon, ToolGlyph } from "@/components/icons";
import { SpacingControls } from "@/components/section";

/** 배지 → 제목 두 줄 → 부제 → CTA 가 순서대로 쓰는 등장 애니메이션. */
const heroItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

/** 도구 카드가 놓이는 자리. 크기 · 회전 · 원근(depth)이 카드마다 달라서
 * 어떤 건 가깝고 크게, 어떤 건 멀고 흐리게 숨쉬듯 움직입니다. */
const SLOTS = [
  { top: 10, left: "3%", rot: -4, size: 84, far: 0.82, blur: 5, dur: 8.5, delay: -1 },
  { top: -6, left: "27%", rot: -3, size: 62, far: 0.74, blur: 7, dur: 7, delay: -3.2 },
  { top: 150, left: "17%", rot: -3, size: 76, far: 0.85, blur: 4, dur: 9.5, delay: -5 },
  { top: 70, left: "45%", rot: 4, size: 98, far: 0.8, blur: 6, dur: 7.8, delay: -0.4 },
  { top: 128, left: "65%", rot: 5, size: 66, far: 0.78, blur: 6, dur: 8.8, delay: -2.6 },
  { top: 4, left: "58%", rot: 3, size: 80, far: 0.85, blur: 4, dur: 6.6, delay: -4.4 },
  { top: 96, left: "83%", rot: -5, size: 70, far: 0.8, blur: 5, dur: 9.2, delay: -1.8 },
  { top: 195, left: "40%", rot: -3, size: 72, far: 0.8, blur: 5, dur: 8.2, delay: -0.8 },
];

export function Hero() {
  const { content, editing, getSectionSpacing } = useContent();
  const layerRef = useRef<HTMLDivElement>(null);
  const spacing = getSectionSpacing("hero");

  // 커서 근처의 카드만 살짝 밀립니다. transform 은 .magnet 에만 씁니다.
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let pointer = { x: -9999, y: -9999 };

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const magnets = layer.querySelectorAll<HTMLElement>(".magnet");
        magnets.forEach((el) => {
          const r = el.getBoundingClientRect();
          const dx = pointer.x - (r.left + r.width / 2);
          const dy = pointer.y - (r.top + r.height / 2);
          const dist = Math.hypot(dx, dy);
          const radius = 260;
          if (dist < radius) {
            const power = (radius - dist) / radius;
            el.style.transform = `translate(${(dx / 9) * power}px, ${(dy / 9) * power}px)`;
          } else {
            el.style.transform = "translate(0, 0)";
          }
        });
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const cards = content.tools.slice(0, SLOTS.length);

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pt-28 pb-16 text-center sm:px-6 sm:pt-32 sm:pb-24"
      style={{
        ...(spacing.top ? { marginTop: `${spacing.top}rem` } : {}),
        ...(spacing.bottom ? { marginBottom: `${spacing.bottom}rem` } : {}),
      }}
    >
      {editing ? <SpacingControls sectionKey="hero" /> : null}

      {/* 본문: 배지 → 제목 두 줄 → 부제 → CTA 순서로 살짝 시차를 두고 나타납니다 */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          variants={heroItem}
          className="glass badge-glow rounded-full px-3.5 py-1.5"
        >
          <T path="hero.badge" className="label" />
        </motion.div>

        {/* 모바일과 데스크탑은 vw 계수를 따로 씁니다. 하나의 clamp 로 묶으면
            좁은 화면에서 vw 값이 최소값 아래로 내려가 글자가 더 이상 커지지 않고
            화면 폭의 60% 정도만 채운 채 작아 보입니다. */}
        <h1 className="display mt-7 text-[clamp(38px,14vw,58px)] sm:mt-8 sm:text-[clamp(58px,8.2vw,84px)]">
          <motion.span variants={heroItem} className="block">
            <T path="hero.titleLine1" />
          </motion.span>
          <motion.span variants={heroItem} className="block">
            <T path="hero.titleLine2" />
          </motion.span>
        </h1>

        <motion.div variants={heroItem}>
          <T
            path="hero.subtitle"
            as="p"
            className="mt-5 max-w-[520px] text-[14px] leading-relaxed text-balance text-dim sm:mt-7 sm:text-[15px] md:text-base"
          />
        </motion.div>

        <motion.div
          variants={heroItem}
          className="mt-8 flex w-full max-w-[280px] flex-col gap-2.5 sm:mt-10 sm:w-auto sm:max-w-none sm:flex-row sm:gap-3">
          <a
            href="#works"
            className="group flex items-center justify-center gap-2 rounded-lg bg-fg px-7 py-3 text-sm font-medium text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,255,255,0.12)]"
          >
            {content.hero.ctaPrimary}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
          <a
            href="#contact"
            className="glass flex items-center justify-center rounded-lg px-7 py-3 text-sm font-medium text-fg transition-colors duration-300 hover:border-white/25 hover:bg-white/6"
          >
            {content.hero.ctaSecondary}
          </a>
        </motion.div>
      </motion.div>

      {/* 도구 카드: CTA 아래, 크기 · 원근이 다른 지그재그 격자 */}
      <div
        ref={layerRef}
        aria-hidden
        className="relative z-10 mx-auto mt-16 hidden h-[300px] w-full max-w-[1040px] md:block"
      >
        {cards.map((tool, i) => {
          const s = SLOTS[i];
          const iconSize = Math.max(16, Math.round(s.size * 0.26));
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1.1,
                delay: 0.5 + i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="slot"
              style={{
                top: s.top,
                left: s.left,
                animationDelay: `${-i * 0.9}s`,
                animationDuration: `${6.5 + (i % 3)}s`,
              }}
            >
              <div className="magnet flex flex-col items-center gap-2.5">
                <div
                  className="depth-card glass glass-top pointer-events-auto flex items-center justify-center rounded-2xl transition-colors duration-300 hover:border-white/25"
                  style={
                    {
                      width: s.size,
                      height: s.size,
                      "--rot": `${s.rot}deg`,
                      "--depth-far": s.far,
                      "--depth-blur": `${s.blur}px`,
                      "--depth-dur": `${s.dur}s`,
                      "--depth-delay": `${s.delay}s`,
                      backgroundColor: "rgba(255,255,255,0.075)",
                    } as CSSProperties
                  }
                >
                  <ToolGlyph id={tool.id} className="text-dim" style={{ width: iconSize, height: iconSize }} />
                </div>
                <span className="font-mono text-[9px] tracking-wider text-muted">
                  {tool.name.toUpperCase()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 1.4 }}
        className="relative z-10 mt-10 flex flex-col items-center gap-2 md:mt-4"
      >
        <ScrollMouseIcon className="h-[22px] w-[22px] text-muted" />
        <T path="hero.hint" className="label" />
      </motion.div>
    </section>
  );
}
