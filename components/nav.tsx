"use client";

import { useEffect, useState } from "react";
import { useContent } from "@/components/content-provider";

export function Nav() {
  const { content } = useContent();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 브랜드 링크까지 포함해서 실제 페이지에 섹션이 나오는 순서 그대로 나열합니다.
  const links = [
    { href: "#top", label: content.nav.home },
    { href: "#studio", label: content.nav.philosophy },
    { href: "#works", label: content.nav.works },
    { href: "#music", label: content.nav.music },
    { href: "#contact", label: content.nav.contact },
  ];

  return (
    // left-1/2 + translate 대신 inset-x-0 + flex justify-center 로 중앙 정렬합니다.
    // (퍼센트 기반 left 계산 대신 flexbox 정렬을 쓰는 편이 더 안전합니다)
    <nav className="fixed inset-x-0 top-5 z-[100] flex justify-center px-4">
      <div className="flex max-w-full flex-col items-center gap-2">
        {/* 1줄: 브랜드부터 Contact까지 하나로 통일된 링크 목록. PC와 모바일 동일 구성.
            폭이 모자라면(초소형 화면) 잘리는 대신 줄바꿈됩니다 */}
        <div
          className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-[28px] border px-3 py-2 font-mono text-[10px] tracking-wider text-dim uppercase transition-colors duration-500 sm:gap-x-6 sm:rounded-full sm:text-[11px] md:gap-x-7 ${
            scrolled
              ? "border-line bg-[rgba(14,14,16,0.72)] backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-fg">
              {l.label}
            </a>
          ))}
        </div>

        {/* 2줄: 제작문의 버튼 */}
        <a
          href="#contact"
          className="rounded-full bg-fg px-3.5 py-1.5 text-[12px] font-medium text-ink transition-transform duration-300 hover:-translate-y-px"
        >
          {content.nav.cta}
        </a>
      </div>
    </nav>
  );
}
