"use client";

import { motion } from "framer-motion";
import { useContent } from "@/components/content-provider";
import { T } from "@/components/editable";
import { Section, SectionHead } from "@/components/section";
import { ToolGlyph } from "@/components/icons";

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Workspace() {
  const { content } = useContent();

  return (
    <Section sectionKey="workspace">
      <SectionHead
        eyebrowPath="workspace.eyebrow"
        titlePath="workspace.title"
        notePath="workspace.note"
      />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="mx-auto grid max-w-[900px] grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4"
      >
        {content.tools.map((tool, i) => {
          const project = content.projects.find((p) => p.id === tool.projectId);
          return (
            <motion.a
              key={tool.id}
              variants={cardVariants}
              href="#works"
              className="glass glass-top group relative flex flex-col gap-3.5 rounded-2xl p-4 transition-all duration-500 hover:-translate-y-1 hover:border-white/22 hover:bg-white sm:gap-4 sm:p-5"
            >
              <ToolGlyph
                id={tool.id}
                className="h-6 w-6 text-dim transition-all duration-300 group-hover:text-ink group-hover:[stroke-width:2.25]"
              />
              <div>
                <T
                  path={`tools.${i}.name`}
                  className="block text-sm font-medium text-fg transition-colors duration-300 group-hover:text-ink group-hover:font-bold"
                />
                <T
                  path={`tools.${i}.role`}
                  className="mt-1 block text-xs text-muted transition-colors duration-300 group-hover:text-ink/70 group-hover:font-semibold"
                />
              </div>
              <span className="label mt-auto opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-ink group-hover:font-semibold">
                {project ? project.title : "—"}
              </span>
            </motion.a>
          );
        })}
      </motion.div>
    </Section>
  );
}
