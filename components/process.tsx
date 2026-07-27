"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useContent } from "@/components/content-provider";
import { T } from "@/components/editable";
import { Section, SectionHead } from "@/components/section";

export function Process() {
  const { content } = useContent();
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.85", "end 0.6"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <Section sectionKey="process">
      <SectionHead
        eyebrowPath="process.eyebrow"
        titlePath="process.title"
        notePath="process.note"
      />

      <ol ref={listRef} className="relative mx-auto max-w-[760px]">
        {/* 문의 → 오픈 까지, 스크롤에 맞춰 그려지는 진행선 */}
        <motion.span
          aria-hidden
          style={{ scaleY: lineScale }}
          className="absolute top-0 left-[25px] h-full w-px origin-top bg-white/35 sm:left-[39px]"
        />
        {content.process.steps.map((step, i) => (
          <li
            key={step.title}
            className="relative grid grid-cols-[52px_1fr] gap-4 border-t border-line py-7 last:border-b sm:grid-cols-[80px_1fr_100px] sm:gap-6"
          >
            <span className="label pt-1">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <T
                path={`process.steps.${i}.title`}
                as="h3"
                className="text-base font-medium tracking-tight text-fg"
              />
              <T
                path={`process.steps.${i}.body`}
                as="p"
                className="mt-2 block text-sm leading-relaxed text-muted"
              />
            </div>
            <T
              path={`process.steps.${i}.duration`}
              className="label col-start-2 sm:col-start-3 sm:pt-1 sm:text-right"
            />
          </li>
        ))}
      </ol>
    </Section>
  );
}
