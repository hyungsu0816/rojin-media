"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/components/content-provider";
import { T } from "@/components/editable";
import { Section } from "@/components/section";

const REPLAY_INTERVAL_MS = 20000;

const pointVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Philosophy() {
  const { content } = useContent();
  const [cycle, setCycle] = useState(0);

  // 스크롤로 한 번 보고 끝나는 게 아니라, 20초마다 카드 등장을 다시 보여줍니다.
  useEffect(() => {
    const id = window.setInterval(() => setCycle((c) => c + 1), REPLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Section id="studio">
      <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
        <T path="philosophy.eyebrow" className="label" />
        <T
          path="philosophy.title"
          as="h2"
          className="display mt-5 text-[clamp(28px,4.6vw,46px)]"
        />
        <T
          path="philosophy.body"
          as="p"
          className="mt-6 max-w-[560px] text-[15px] leading-[1.75] text-dim"
        />
      </div>

      <motion.div
        key={cycle}
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14 } } }}
        className="mt-20 grid gap-px overflow-hidden rounded-2xl border border-line bg-line-soft md:grid-cols-3"
      >
        {content.philosophy.points.map((p, i) => (
          <motion.div
            key={p.title}
            variants={pointVariants}
            className="group bg-ink/85 px-7 py-10 backdrop-blur-sm transition-colors duration-500 hover:bg-white"
          >
            <span className="label transition-colors duration-500 group-hover:text-ink">
              {String(i + 1).padStart(2, "0")}
            </span>
            <T
              path={`philosophy.points.${i}.title`}
              as="h3"
              className="mt-5 block text-lg font-medium tracking-tight text-fg transition-colors duration-500 group-hover:text-ink group-hover:font-bold"
            />
            <T
              path={`philosophy.points.${i}.body`}
              as="p"
              className="mt-3 block text-sm leading-relaxed text-muted transition-colors duration-500 group-hover:text-ink/70 group-hover:font-semibold"
            />
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
