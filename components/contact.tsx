"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/components/content-provider";
import { T } from "@/components/editable";
import { Section } from "@/components/section";
import { ArrowRight } from "@/components/icons";

const REPLAY_INTERVAL_MS = 20000;

const serviceVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

function KakaoGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3.6c-4.7 0-8.5 3-8.5 6.7 0 2.4 1.6 4.5 4 5.7l-.9 3.4c-.1.3.2.5.5.4l4-2.6c.3 0 .6.1.9.1 4.7 0 8.5-3 8.5-6.7S16.7 3.6 12 3.6Z" />
    </svg>
  );
}

export function Contact() {
  const { content } = useContent();
  const mailto = `mailto:${content.brand.email}?subject=${encodeURIComponent(
    "[제작문의] ",
  )}`;
  const [cycle, setCycle] = useState(0);

  // 스크롤로 한 번 보고 끝나는 게 아니라, 20초마다 카드 등장을 다시 보여줍니다.
  useEffect(() => {
    const id = window.setInterval(() => setCycle((c) => c + 1), REPLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Section id="contact">
      <div className="mx-auto flex max-w-[720px] flex-col items-center text-center">
        <T path="contact.eyebrow" className="label" />
        <T
          path="contact.title"
          as="h2"
          className="display mt-4 text-[clamp(28px,7.4vw,58px)] sm:mt-5"
        />
        <T
          path="contact.body"
          as="p"
          className="mt-5 max-w-[520px] text-[14px] leading-relaxed text-balance text-dim sm:mt-6 sm:text-[15px]"
        />

        <div className="mt-8 flex w-full max-w-[300px] flex-col gap-2.5 sm:mt-10 sm:w-auto sm:max-w-none sm:flex-row sm:gap-3">
          <a
            href={content.brand.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 rounded-lg bg-kakao px-7 py-3.5 text-sm font-semibold text-[#191600] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(254,229,0,0.18)]"
          >
            <KakaoGlyph className="h-4 w-4" />
            {content.contact.kakaoLabel}
          </a>
          <a
            href={mailto}
            className="glass group flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-sm font-medium text-fg transition-colors duration-300 hover:border-white/25 hover:bg-white/6"
          >
            {content.contact.emailLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
        </div>

        <T path="contact.note" className="label mt-6" />
        <a
          href={mailto}
          className="mt-2 font-mono text-xs text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
        >
          {content.brand.email}
        </a>
      </div>

      <motion.div
        key={cycle}
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14 } } }}
        className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line-soft sm:mt-20 md:grid-cols-3"
      >
        {content.contact.services.map((s, i) => (
          <motion.div
            key={s.title}
            variants={serviceVariants}
            className="bg-ink/85 px-6 py-7 backdrop-blur-sm sm:px-7 sm:py-9"
          >
            <T
              path={`contact.services.${i}.title`}
              as="h3"
              className="text-sm font-medium text-fg"
            />
            <T
              path={`contact.services.${i}.body`}
              as="p"
              className="mt-2 block text-sm leading-relaxed text-muted"
            />
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
