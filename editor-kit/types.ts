/** 편집 모드에서 텍스트 하나하나에 거는 글자 크기 · 행간 · 여백 · 정렬.
 * 키는 그 텍스트의 content 경로(예: "hero.subtitle")입니다. */
export type TextStyle = {
  size?: number; // 1 = 기본 배율(em)
  lineHeight?: number;
  margin?: number; // em 단위, 텍스트 위·아래 여백
  align?: "left" | "center" | "right";
};

/** 프로젝트마다 다른 콘텐츠 타입 T 는 최소한 이 모양이어야 합니다.
 * textStyles 는 편집 모드의 텍스트별 스타일 오버라이드를 담는 자리입니다. */
export type EditableContent = {
  textStyles: Record<string, TextStyle>;
};
