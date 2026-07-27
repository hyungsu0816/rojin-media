// ─────────────────────────────────────────────────────────────
// 새 프로젝트에서 시작할 때 참고할 예시입니다. 그대로 쓰지 말고
// content/site.ts 같은 파일로 옮긴 뒤 실제 문구·데이터로 채우세요.
//
// 지켜야 할 규칙은 딱 하나: 최상위에 `textStyles: {}` 필드를 넣는 것.
// (ContentProvider 의 EditableContent 제약을 만족시키기 위함입니다.)
// ─────────────────────────────────────────────────────────────

import type { TextStyle } from "./types";

export type Project = {
  id: string;
  title: string;
  summary: string;
  image: string;
  href: string;
};

export type SiteContent = typeof defaultContent;

export const defaultContent = {
  brand: {
    name: "my-project",
    email: "hello@example.com",
  },

  hero: {
    title: "여기에 제목",
    subtitle: "여기에 소개 문구",
  },

  projects: [
    {
      id: "p1",
      title: "프로젝트 1",
      summary: "설명",
      image: "",
      href: "#",
    },
  ] as Project[],

  /** 편집 모드에서 개별 텍스트에 준 크기 · 행간 · 여백 · 정렬 오버라이드.
   * ContentProvider 가 내부적으로 읽고 씁니다 — 직접 건드릴 일은 없습니다. */
  textStyles: {} as Record<string, TextStyle>,
};
