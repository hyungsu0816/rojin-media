# editor-kit

이 프로젝트(rojin_media)에서 만든 "브라우저에서 바로 고치는 편집 모드"를
다음 프로젝트에도 그대로 옮겨 쓰기 위해 통째로 뺀 폴더입니다.

**여기 안의 코드는 실제 사이트의 `components/`에 있던 것과 동작이 100% 동일합니다.**
바뀐 건 프로젝트마다 다른 부분(콘텐츠 타입, localStorage 키, 목록 편집 탭 구성)을
바깥에서 주입받도록 살짝 일반화한 것뿐입니다.

## 뭐가 되나요

- 텍스트 클릭 → 그 자리에서 수정 (Enter 확정, Shift+Enter 줄바꿈)
- 텍스트 포커스 시 뜨는 미니 툴바로 글자 크기 · 행간 · 여백 · 정렬 조절 (텍스트별로 따로 저장)
- 하단 바: 목록 편집 서랍 / 저장 / JSON 내보내기·불러오기 / 초기화 / 완료
- `Ctrl+Alt+E` 또는 `?edit=1` 로 편집 모드 진입
- 전부 `localStorage` 에 저장, JSON 내보내기로 코드에 반영 가능

## 파일 구성

```
editor-kit/
  lib/path.ts               getPath · setPath · deepMerge (그대로 재사용)
  types.ts                  TextStyle, EditableContent 타입
  icons.tsx                 툴바용 정렬 아이콘 3개
  content-provider.tsx      <ContentProvider> + useContent() — 완전히 범용
  editable.tsx               <T path="..."> 컴포넌트 + 스타일 툴바 — 완전히 범용
  editor-bar.tsx             <EditorBar sections={...}> + <Field> — "그릇"은 범용, 내용은 주입
  styles.css                 위 컴포넌트들이 요구하는 CSS 전부
  example-content.ts          ← 프로젝트별 콘텐츠 타입 작성 예시 (참고용, 복붙 후 수정)
  example-editor-sections.tsx ← 목록 편집 탭 구성 예시 (참고용, 복붙 후 수정)
```

`content-provider.tsx`, `editable.tsx`, `lib/path.ts`, `icons.tsx` 는 **어떤 콘텐츠
모양이든 그대로 재사용**됩니다. `example-*` 두 파일만 프로젝트마다 새로 씁니다.

## 새 프로젝트에 넣는 순서

1. 이 폴더를 새 프로젝트의 `editor-kit/` (또는 원하는 이름)로 통째로 복사
2. `styles.css` 내용을 새 프로젝트의 `globals.css` 에 붙여넣기
   (Tailwind 4 `@theme` 문법 기준. 색 토큰 이름이 겹치면 병합)
3. `example-content.ts` 를 참고해서 `content/site.ts` 를 작성
   — 핵심은 최상위에 `textStyles: {} as Record<string, TextStyle>` 넣는 것 하나뿐
4. `example-editor-sections.tsx` 를 참고해서 실제 콘텐츠에 맞는
   `EditorSection[]` 을 만드는 훅/함수를 작성 (`useEditorSections()` 같은 이름)
5. `app/layout.tsx` 에서 아래처럼 감싸기:

   ```tsx
   import { ContentProvider } from "@/editor-kit/content-provider";
   import { defaultContent } from "@/content/site";

   export default function RootLayout({ children }) {
     return (
       <html lang="ko">
         <body>
           <ContentProvider defaultContent={defaultContent} storageKey="my-project:content">
             {children}
           </ContentProvider>
         </body>
       </html>
     );
   }
   ```

6. 아무 페이지에서나 EditorBar 를 한 번 렌더:

   ```tsx
   import { EditorBar } from "@/editor-kit/editor-bar";
   import { useEditorSections } from "@/editor-kit/example-editor-sections"; // 프로젝트용으로 새로 쓴 버전

   function Page() {
     const sections = useEditorSections();
     return (
       <>
         {/* ...페이지 내용... */}
         <EditorBar sections={sections} />
       </>
     );
   }
   ```

7. 텍스트를 고치고 싶은 자리마다:

   ```tsx
   import { T } from "@/editor-kit/editable";

   <T path="hero.title" as="h1" className="text-4xl" />;
   ```

## 주의할 것

- `storageKey` 는 프로젝트마다 다른 문자열을 쓰세요 (겹치면 두 프로젝트가 localStorage 를 공유하게 됩니다).
- `content/site.ts` 의 `SiteContent` 타입에는 반드시 `textStyles: Record<string, TextStyle>` 필드가 있어야
  `ContentProvider<T extends EditableContent>` 제약을 통과합니다.
- 목록 편집 탭(`EditorSection[]`)은 콘텐츠 모양에 딱 붙어있는 부분이라 프로젝트마다 새로 씁니다.
  `<Field label="..." path="..." />` 를 이어붙이기만 하면 되므로 오래 걸리지 않습니다.
- `.glass` · `.editable` · `.label` 클래스명이 이미 다른 용도로 쓰이고 있다면 `styles.css` 를
  붙여넣기 전에 이름을 바꿔주세요.
