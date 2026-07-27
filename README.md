# rojin_media

포트폴리오 + 제작문의 사이트. Next.js 16 · React 19 · Tailwind 4 · Framer Motion.

## 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

빌드는 `npm run build`, 배포는 Vercel에 그대로 올리면 됩니다.

## 콘텐츠 수정하는 두 가지 방법

### 1) 브라우저에서 바로 고치기 (편집 모드)

- `Ctrl + Alt + E` 를 누르거나 주소 뒤에 `?edit=1` 을 붙이면 편집 모드가 켜집니다. (방문자가 실수로 누르지 않도록 조합을 하나 더 넣었습니다)
- 점선이 생긴 **텍스트는 클릭해서 그 자리에서** 고칩니다. (Enter 누르면 확정, Shift+Enter 누르면 줄바꿈)
- 텍스트를 클릭하면 위(또는 아래)에 **작은 툴바**가 떠서 글자 크기 · 행간 · 여백 · 정렬을 그 텍스트만 따로 바꿀 수 있습니다. 툴바의 × 버튼은 그 텍스트의 스타일만 초기화합니다.
- 하단 바 → **목록 편집** 을 열면 프로젝트·도구·트랙·브랜드 정보를 폼으로 고칩니다.
  - 프로젝트 이미지 URL, 링크
  - 트랙 음원 경로, BPM, 길이
  - 카카오채널 URL, 이메일
- 수정한 내용은 그 브라우저에만 저장됩니다(localStorage). 방문자 화면은 그대로입니다.

### 2) 수정본을 코드에 반영하기

1. 편집 모드 하단 바 → **JSON 내보내기** → `rojin-media-content.json` 저장
2. 그 값을 `content/site.ts` 의 `defaultContent` 에 옮겨 적기
3. 커밋 → 배포하면 모든 방문자에게 반영됩니다

> 다른 기기에서 이어서 고칠 때는 **불러오기** 로 JSON을 넣으면 됩니다.
> **초기화** 는 저장본을 지우고 `content/site.ts` 기본값으로 되돌립니다.

## 이미지 · 음원 넣기

- 이미지: `public/works/` 에 넣고 편집 모드에서 경로를 `/works/파일명.jpg` 로 입력
- 음원: `public/audio/` 에 넣고 `/audio/파일명.mp3` 로 입력
- 음원 경로가 비어 있으면 플레이어는 길이 기준으로 진행 표시만 하는 프리뷰로 동작합니다

## 구조

```
app/
  layout.tsx        폰트 · 메타 · Provider
  page.tsx          섹션 조립 순서
  globals.css       색·타입 토큰, 스트립·플로팅 카드 CSS
content/site.ts     사이트의 모든 문구와 데이터 (여기만 고치면 됨)
components/
  hero.tsx          플로팅 도구 카드 + 커서 반응
  selected-works.tsx 3D 드래그 스트립 (자동 회전 0.25px/f, 깊이 220, 기울기 26°)
  music.tsx         앨범아트 · 파형 · 플레이리스트
  contact.tsx       카카오채널 · 메일 링크
  editor/           편집 모드 바와 서랍
```

## 문의 연결

`content/site.ts` 의 `brand.kakaoUrl` 을 실제 카카오톡 채널 주소로 바꾸세요.
(채널 관리자센터 → 채널 홈 URL, 형식: `https://pf.kakao.com/_XXXXX`)
메일은 `brand.email` 을 바꾸면 버튼이 `mailto:` 로 연결되고 제목에 `[제작문의]` 가 채워집니다.

## 남은 것

- [ ] 프로젝트 5개 썸네일 이미지
- [ ] 실제 카카오채널 URL · 이메일
- [ ] PaceBeat / fromy 음원 또는 유튜브 링크
- [ ] 프로젝트별 상세 페이지 (지금은 외부 링크로 열림)
