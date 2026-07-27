"use client";

import { useContent } from "@/components/content-provider";
import { T } from "@/components/editable";

export function Footer() {
  const { content } = useContent();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-6 px-6 py-12 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <span className="font-mono text-[13px] text-fg">{content.brand.name}</span>
          <T path="footer.note" className="label" />
        </div>

        <div className="flex items-center gap-5">
          <a
            href={content.brand.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="label transition-colors hover:text-fg"
          >
            youtube
          </a>
          <a
            href={content.brand.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="label transition-colors hover:text-fg"
          >
            instagram
          </a>
          <span className="label">
            © {year} {content.brand.location}
          </span>
        </div>
      </div>
    </footer>
  );
}
