"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "@/components/content-provider";
import { T } from "@/components/editable";
import { Section, SectionHead } from "@/components/section";
import { ArrowRight } from "@/components/icons";

const CARD_W = 300; // 카드 간격
const AUTO = 0.25; // 원본(0.5) 대비 50% 감속
const DEPTH = 220; // 원본(500) 대비 깊이 축소
const TILT = 26; // 원본(45deg) 대비 회전 축소

export function SelectedWorks() {
  const { content, editing } = useContent();
  const projects = content.projects;
  const count = projects.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const scroll = useRef(0);
  const target = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const dragDist = useRef(0);

  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const loop = () => {
      if (!dragging.current) {
        target.current += velocity.current;
        velocity.current *= 0.94;
        if (!reduce && !editing) target.current += AUTO;
      }
      scroll.current += (target.current - scroll.current) * 0.07;

      const total = count * CARD_W;
      const spread = Math.min(window.innerWidth, 1080) / 1.6;
      let nearest = 0;
      let nearestDist = Infinity;

      cardsRef.current.forEach((el, i) => {
        if (!el) return;
        let v = i * CARD_W - scroll.current;
        while (v < -total / 2) v += total;
        while (v > total / 2) v -= total;

        const p = Math.max(-1.7, Math.min(1.7, v / spread));
        const abs = Math.abs(p);
        el.style.transform = `translateX(${v}px) translateZ(${-(abs * abs) * DEPTH}px) rotateY(${
          p * TILT
        }deg)`;
        el.style.opacity = String(Math.max(0, 1 - Math.pow(abs, 2.2)));
        el.style.zIndex = String(1000 - Math.round(Math.abs(v)));
        el.style.pointerEvents = Math.abs(v) < CARD_W ? "auto" : "none";

        if (Math.abs(v) < nearestDist) {
          nearestDist = Math.abs(v);
          nearest = i;
        }
      });

      setActive((prev) => (prev === nearest ? prev : nearest));
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [count, editing]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    dragDist.current = 0;
    velocity.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = e.clientX - lastX.current;
    lastX.current = e.clientX;
    dragDist.current += Math.abs(delta);
    target.current -= delta * 1.3;
    velocity.current = -delta * 0.45;
  }, []);

  // setPointerCapture(위 onPointerDown)를 걸어두면, 브라우저가 그 뒤의 실제
  // click 이벤트를 캡처한 컨테이너로 "재타겟"해버립니다 — 그래서 각 카드의
  // onClick(자식 엘리먼트에 달려있음)이 실제 마우스 클릭에서는 아예 호출되지
  // 않습니다(el.click() 같은 코드로 흉내낸 클릭은 이 과정을 안 거치므로 정상 작동해서
  // 발견이 늦었습니다). 게다가 카드에는 3D transform(translateZ · rotateY)이 걸려있어
  // elementFromPoint 로도 카드를 정확히 못 찾습니다 — 그래서 각 카드의
  // getBoundingClientRect() 로 포인터를 뗀 화면 좌표가 어느 카드 위인지 직접 계산합니다.
  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const wasDrag = dragDist.current > 15;
      dragging.current = false;
      if (wasDrag) return;

      const idx = cardsRef.current.findIndex((el) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return (
          e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
        );
      });
      const project = idx >= 0 ? projects[idx] : null;
      if (project?.href && project.href !== "#") {
        window.open(project.href, "_blank", "noopener");
      }
    },
    [projects],
  );

  const endDrag = useCallback(() => {
    dragging.current = false;
  }, []);

  const step = useCallback((dir: number) => {
    target.current += dir * CARD_W;
    velocity.current = 0;
  }, []);

  return (
    <Section id="works">
      <SectionHead
        eyebrowPath="works.eyebrow"
        titlePath="works.title"
        notePath="works.note"
      />

      <div
        className="strip-viewport relative mx-auto flex h-[380px] w-full items-center justify-center sm:h-[440px]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div ref={stageRef} className="strip-stage relative h-full w-full">
          {projects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="work-card"
            >
              <article className="glass group h-full w-full overflow-hidden rounded-xl transition-colors duration-500 hover:border-white/20">
                <div className="relative h-[68%] w-full overflow-hidden bg-white/3">
                  {project.image ? (
                    // 외부 URL도 그대로 쓰기 위해 img 태그를 씁니다.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.image}
                      alt={project.title}
                      draggable={false}
                      className="h-full w-full object-cover opacity-85 transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                      <span className="font-mono text-3xl text-white/15">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="label">
                        {editing ? "이미지 URL 입력" : "no image"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex h-[32%] flex-col justify-center gap-1.5 px-4">
                  <div className="flex items-center justify-between">
                    <T
                      path={`projects.${i}.title`}
                      className="text-[15px] font-medium tracking-tight text-fg"
                    />
                    <span className="label">{project.year}</span>
                  </div>
                  <T path={`projects.${i}.kind`} className="label" />
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* 가운데 카드 설명 */}
      <div className="mx-auto mt-10 flex max-w-[560px] flex-col items-center text-center">
        <span className="label">
          {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <T
              path={`projects.${active}.summary`}
              as="p"
              className="mt-4 text-[15px] leading-relaxed text-dim"
            />
            <T path={`projects.${active}.role`} className="label mt-4" />
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="이전 작업"
            className="glass flex h-9 w-9 items-center justify-center rounded-full text-dim transition-colors hover:border-white/25 hover:text-fg"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="다음 작업"
            className="glass flex h-9 w-9 items-center justify-center rounded-full text-dim transition-colors hover:border-white/25 hover:text-fg"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Section>
  );
}
