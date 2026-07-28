"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { useContent } from "@/components/content-provider";
import { T } from "@/components/editable";
import { Section } from "@/components/section";

/** "120+", "5" 처럼 순수 숫자(+접미사만 허용)인 값만 0에서부터 세어 올립니다.
 * "2~4" 같은 범위 값은 세는 게 어색해서 그대로 페이드인만 합니다. */
function CountUpValue({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const match = /^(\d+)(\+?)$/.exec(value);
  const [display, setDisplay] = useState(match ? `0${match[2]}` : value);

  useEffect(() => {
    if (!inView || !match) return;
    const target = parseInt(match[1], 10);
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(`${Math.round(v)}${match[2]}`),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <span ref={ref} className={className}>
      {match ? display : value}
    </span>
  );
}

export function Numbers() {
  const { content, editing } = useContent();

  return (
    <Section sectionKey="numbers">
      <div className="flex flex-col items-center text-center">
        <T path="numbers.eyebrow" className="label" />
        <T
          path="numbers.title"
          as="h2"
          className="display mt-4 text-[clamp(26px,8vw,36px)] sm:mt-5 sm:text-[clamp(36px,4.6vw,46px)]"
        />
      </div>

      <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line-soft sm:mt-16 lg:grid-cols-4">
        {content.numbers.stats.map((stat, i) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-2 bg-ink/85 px-4 py-9 backdrop-blur-sm sm:py-12"
          >
            {editing ? (
              <T
                path={`numbers.stats.${i}.value`}
                className="font-mono text-[clamp(30px,4vw,44px)] tracking-tight text-fg"
              />
            ) : (
              <CountUpValue
                value={stat.value}
                className="font-mono text-[clamp(30px,4vw,44px)] tracking-tight text-fg"
              />
            )}
            <T path={`numbers.stats.${i}.label`} className="label" />
          </div>
        ))}
      </div>
    </Section>
  );
}
