// ─────────────────────────────────────────────────────────────
// 사이트의 모든 텍스트 · 이미지 · 링크의 "빌드 시점 기본값"입니다.
// 편집 모드에서 "저장"을 누르면 content/site-data.json 파일에 기록되고,
// 브라우저는 그 파일을 fetch로 읽어와 이 기본값 위에 덮어씁니다
// (일부러 import 하지 않습니다 — import 하면 저장할 때마다 개발 서버가
// "소스 코드가 바뀌었다"고 보고 페이지를 통째로 리로드해서 편집 모드가 꺼집니다).
//
// 이 파일 자체를 오래 방치하면 site-data.json 과 벌어질 수 있으니,
// 가끔 편집 모드 → JSON 내보내기 로 받은 값을 여기 옮겨서 맞춰주세요.
// ─────────────────────────────────────────────────────────────

export type Project = {
  id: string;
  title: string;
  kind: string;
  year: string;
  summary: string;
  role: string;
  image: string;
  href: string;
};

export type Tool = {
  id: string;
  name: string;
  role: string;
  projectId: string;
};

export type Track = {
  id: string;
  title: string;
  project: string;
  bpm: string;
  duration: string;
  src: string;
  cover: string;
};

/** PaceBeat 유튜브 채널에 실제로 올라온 영상 목록(스냅샷).
 * 채널에 새 영상이 올라와도 자동으로 늘어나진 않고, 필요할 때 다시 받아와 갱신합니다. */
export type YoutubeVideo = {
  id: string;
  title: string;
  videoId: string;
  thumb: string;
};

/** 편집 모드에서 텍스트 하나하나에 거는 글자 크기 · 행간 · 정렬.
 * 키는 그 텍스트의 content 경로(예: "hero.subtitle")입니다. */
export type TextStyle = {
  size?: number; // 1 = 기본 배율
  lineHeight?: number;
  align?: "left" | "center" | "right";
  margin?: number; // em 단위, 텍스트 위·아래 여백
};

/** 섹션(파트) 하나의 위·아래에 더하는 여백. rem 단위, 기본 여백에 더해집니다. */
export type SectionSpacing = {
  top?: number;
  bottom?: number;
};

export type SiteContent = typeof defaultContent;

export const defaultContent = {
  brand: {
    name: "rojin_media",
    tagline: "AI Creative Studio",
    location: "Seoul, KR",
    email: "hs-rojin@naver.com",
    kakaoUrl: "https://open.kakao.com/me/rojin_media",
    instagramUrl: "https://instagram.com/peekly.fun",
    youtubeUrl: "https://www.youtube.com/@pacebeatmusic",
  },

  nav: {
    home: "MIND STUDIO",
    philosophy: "PHILOSOPHY",
    works: "WORKS",
    music: "MUSIC",
    contact: "CONTACT",
    cta: "제작문의",
  },

  hero: {
    badge: "DIGITAL MIND STUDIO",
    titleLine1: "FROM IDEA",
    titleLine2: "TO LAUNCH.",
    subtitle:
      "아이디어에서 끝나는 것이 아니라 기획, 디자인, 개발, 배포까지\n하나의 흐름으로 완성합니다.",
    ctaPrimary: "작업물 보기",
    ctaSecondary: "제작문의",
    hint: "scroll",
  },

  philosophy: {
    eyebrow: "PHILOSOPHY",
    title: "DESIGNING THE FLOW.",
    body:
      "좋은 결과물은 좋은 도구만으로 만들어지지 않습니다.\n문제를 이해하고, 가장 적합한 도구를 연결하는 과정이 더 중요합니다.",
    points: [
      {
        title: "ONE VISION",
        body:
          "기획부터 디자인, 개발과 배포까지. 하나의 방향으로 일관성 있게 완성합니다.",
      },
      {
        title: "BUILD FAST",
        body:
          "문서보다 화면을 먼저 만듭니다. 보면서 수정하는 것이 가장 빠른 방법입니다.",
      },
      {
        title: "KEEP IMPROVING",
        body:
          "오픈은 끝이 아닙니다. 운영하면서 계속 다듬고 발전시킵니다.",
      },
    ],
  },

  works: {
    eyebrow: "SELECTED WORKS",
    title: "WHAT I BUILT.",
    note: "드래그해서 넘겨보세요 · 클릭하면 자세히 볼 수 있습니다.",
  },

  projects: [
    {
      id: "pacebeat",
      title: "PaceBeat",
      kind: "YouTube Channel",
      year: "2026",
      summary:
        "러닝 케이던스에 맞춘 BPM 음악 채널. 프롬프트 · 생성 · 편집 · 업로드까지 전 과정을 시스템으로 묶었습니다.",
      role: "Concept · Music · Motion · Thumbnail",
      image: "/works/pacebeat_by.PNG",
      href: "https://www.youtube.com/@pacebeatmusic",
    },
    {
      id: "fromy",
      title: "fromy",
      kind: "Music Project",
      year: "2026",
      summary: "감정의 결을 따라가는 음악 프로젝트. 트랙과 비주얼을 함께 설계했습니다.",
      role: "Concept · Music · Artwork",
      image: "/works/fromy_logo.png",
      href: "https://www.youtube.com/@from_moment",
    },
    {
      id: "onjeong",
      title: "온정필라테스",
      kind: "Brand Website",
      year: "2026",
      summary:
        "동네 스튜디오의 첫 홈페이지. 수업 안내부터 상담 문의까지 한 화면에서 끝나도록 정리했습니다.",
      role: "Design · Build · Deploy",
      image: "/works/onjung_symbol.png",
      href: "https://onjeong-pilates.vercel.app/",
    },
    {
      id: "weroh",
      title: "위로커피로스터리",
      kind: "Brand Website",
      year: "2026",
      summary:
        "로스터리의 톤을 그대로 옮긴 미니멀 브랜드 사이트. 사장님이 직접 고칠 수 있는 편집 모드를 넣었습니다.",
      role: "Design · Build · CMS",
      image: "/works/weroh_logo.png",
      href: "https://weroh-roastery.vercel.app/",
    },
    {
      id: "woongyeol",
      title: "운결 사주풀이",
      kind: "Web Service",
      year: "2026",
      summary:
        "생년월일을 넣으면 무료 요약을 주고, 원하면 AI 해석까지 이어지는 사주 서비스. 결제까지 붙였습니다.",
      role: "Product · Build · Payments",
      image: "/works/woongyrol_logo.png",
      href: "https://ungyeol-sage.vercel.app/",
    },
  ] as Project[],

  workspace: {
    eyebrow: "WORKSPACE",
    title: "TOOLS I TRUST.",
    note: "도구를 많이 사용하는 것이 아니라 프로젝트에 맞는 도구를 선택합니다.",
  },

  tools: [
    { id: "claude", name: "Claude", role: "설계 · 코드", projectId: "woongyeol" },
    { id: "gemini", name: "Gemini", role: "리서치 · 아이디어", projectId: "woongyeol" },
    { id: "chatgpt", name: "ChatGPT", role: "카피 · 프롬프트", projectId: "pacebeat" },
    { id: "canva", name: "Canva", role: "썸네일 · 그래픽", projectId: "pacebeat" },
    { id: "suno", name: "Suno", role: "트랙 생성", projectId: "fromy" },
    { id: "capcut", name: "CapCut", role: "영상 편집", projectId: "pacebeat" },
    { id: "nextjs", name: "Next.js", role: "웹 구현", projectId: "weroh" },
    { id: "github", name: "GitHub", role: "버전 · 배포", projectId: "onjeong" },
  ] as Tool[],

  process: {
    eyebrow: "PROCESS",
    title: "HOW IT WORKS.",
    note: "복잡한 과정을 단순하고 명확하게 만듭니다.",
    steps: [
      {
        title: "문의",
        body: "카카오톡이나 메일로 하고 싶은 것을 편하게 적어주세요. 정리되지 않아도 괜찮습니다.",
        duration: "당일 회신",
      },
      {
        title: "정리",
        body: "필요한 페이지와 기능, 일정과 비용을 한 장으로 정리해 드립니다.",
        duration: "1~2일",
      },
      {
        title: "제작",
        body: "화면을 먼저 세우고 링크로 공유합니다. 보면서 함께 고칩니다.",
        duration: "1~3주",
      },
      {
        title: "오픈",
        body: "도메인과 배포까지 마치고, 직접 수정할 수 있는 방법을 알려드립니다.",
        duration: "반나절",
      },
    ],
  },

  music: {
    eyebrow: "MUSIC",
    title: "SOUND I MADE.",
    note: "PaceBeat · fromy에서 제작한 음악 프로젝트입니다.",
  },

  tracks: [
    { id: "t1", title: "Finish Strong", project: "PaceBeat", bpm: "180", duration: "2:38", src: "/audio/pacebeat-finish-strong.mp3", cover: "/works/cover-pacebeat.svg" },
    { id: "t2", title: "Home Stretch", project: "PaceBeat", bpm: "170", duration: "2:14", src: "/audio/pacebeat-home-stretch.mp3", cover: "/works/cover-pacebeat.svg" },
    { id: "t3", title: "Personal Best", project: "PaceBeat", bpm: "175", duration: "2:34", src: "/audio/pacebeat-personal-best.mp3", cover: "/works/cover-pacebeat.svg" },
    { id: "t4", title: "계획만 세워둔 여행", project: "fromy", bpm: "96", duration: "2:29", src: "/audio/fromy-01-계획만-세워둔-여행.mp3", cover: "/works/cover-fromy.svg" },
    { id: "t5", title: "내일은 조금 다르기를", project: "fromy", bpm: "82", duration: "3:27", src: "/audio/fromy-02-내일은-조금-다르기를.mp3", cover: "/works/cover-fromy.svg" },
    { id: "t6", title: "늦은 밤 편의점 앞에서", project: "fromy", bpm: "74", duration: "3:27", src: "/audio/fromy-03-늦은-밤-편의점-앞에서.mp3", cover: "/works/cover-fromy.svg" },
    { id: "t7", title: "아이스커피 두 잔", project: "fromy", bpm: "100", duration: "2:29", src: "/audio/fromy-04-아이스커피-두-잔.mp3", cover: "/works/cover-fromy.svg" },
    { id: "t8", title: "에어컨 아래 피크닉", project: "fromy", bpm: "104", duration: "2:14", src: "/audio/fromy-05-에어컨-아래-피크닉.mp3", cover: "/works/cover-fromy.svg" },
    { id: "t9", title: "오늘도 퇴근했어요", project: "fromy", bpm: "78", duration: "3:24", src: "/audio/fromy-06-오늘도-퇴근했어요.mp3", cover: "/works/cover-fromy.svg" },
  ] as Track[],

  // PaceBeat 유튜브 채널(youtube.com/@pacebeatmusic)에 실제로 올라온 영상 목록입니다.
  // 채널에 새 영상이 올라와도 여기 목록이 자동으로 늘어나진 않습니다.
  youtubeVideos: [
    { id: "v1", title: "180 BPM Running Music | Evening Night Run 🌙 | Pop Rock Running Playlist | PaceBeat", videoId: "7vtdf8jbvOA", thumb: "https://i.ytimg.com/vi/7vtdf8jbvOA/hqdefault.jpg" },
    { id: "v2", title: "180 BPM Running Music | 5K Pace Maker | Funk Pop Workout | 30 MIN Playlist", videoId: "72c9Yk4_uDE", thumb: "https://i.ytimg.com/vi/72c9Yk4_uDE/hqdefault.jpg" },
    { id: "v3", title: "170 BPM Running Music | Summer Sunset Run 🌅 | 45 MIN Tempo Run | Indie Pop Running Playlist", videoId: "bHOq3I-I868", thumb: "https://i.ytimg.com/vi/bHOq3I-I868/hqdefault.jpg" },
    { id: "v4", title: "160 BPM Running Music | Summer Morning Run ☀ | 60 MIN Running Playlist | Tropical Pop Workout", videoId: "rEk3AGqTGDA", thumb: "https://i.ytimg.com/vi/rEk3AGqTGDA/hqdefault.jpg" },
    { id: "v5", title: "MARATHON 160 BPM Running Music | Endurance Run | Country Pop | 60 MIN | PaceBeat", videoId: "vFeXOzqD0fI", thumb: "https://i.ytimg.com/vi/vFeXOzqD0fI/hqdefault.jpg" },
    { id: "v6", title: "180 BPM Running Music | 45 MIN Speed Run | 5:30/km Pace | Funk Pop Playlist", videoId: "MCbZS2fMj28", thumb: "https://i.ytimg.com/vi/MCbZS2fMj28/hqdefault.jpg" },
    { id: "v7", title: "170 BPM Running Music | 45 MIN Tempo Run | 6:00 Pace | Indie Pop Running Playlist", videoId: "aY6jhvGOdhg", thumb: "https://i.ytimg.com/vi/aY6jhvGOdhg/hqdefault.jpg" },
    { id: "v8", title: "160 BPM Running Music | 6:30 Pace | 45 MIN Easy Run | Forest Morning 🌿", videoId: "bs8-25te_Co", thumb: "https://i.ytimg.com/vi/bs8-25te_Co/hqdefault.jpg" },
    { id: "v9", title: "Marathon Running Music | 67 MIN Endurance Run | The Long Journey ⚪ | Instrumental Workout Music", videoId: "v98cMkKgDvE", thumb: "https://i.ytimg.com/vi/v98cMkKgDvE/hqdefault.jpg" },
    { id: "v10", title: "180 BPM Running Music | 34 MIN Speed Run | Beyond Your Limits 🟠 | Instrumental Workout Music", videoId: "Zle_5TSrF1Y", thumb: "https://i.ytimg.com/vi/Zle_5TSrF1Y/hqdefault.jpg" },
    { id: "v11", title: "170 BPM Running Music | 45 MIN Tempo Run | Chase Your Best Pace 🔵 | Instrumental Workout Music", videoId: "mL0SsEveNvU", thumb: "https://i.ytimg.com/vi/mL0SsEveNvU/hqdefault.jpg" },
    { id: "v12", title: "160 BPM Running Music | 44 MIN Easy Run Playlist | Escape Into Nature 🌿 | Instrumental Workout Music", videoId: "vtauaECCap0", thumb: "https://i.ytimg.com/vi/vtauaECCap0/hqdefault.jpg" },
  ] as YoutubeVideo[],

  // fromy 유튜브 채널(youtube.com/@from_moment)에 실제로 올라온 영상 목록입니다.
  fromyVideos: [
    { id: "f1", title: "여름엔 일단 나가자 | 드라이브부터 한강의 밤까지 🌊", videoId: "kUOeI2Bto-M", thumb: "https://i.ytimg.com/vi/kUOeI2Bto-M/hqdefault.jpg" },
    { id: "f2", title: "아이스커피 두 잔 | 햇살 가득한 여름 오후의 플레이리스트 ☕ fromy", videoId: "3F_BXRtsv0I", thumb: "https://i.ytimg.com/vi/3F_BXRtsv0I/hqdefault.jpg" },
    { id: "f3", title: "내일은 조금 다르기를 | 잠들기 전 듣는 감성 발라드 | 🌙 fromy", videoId: "WR3pCWO678s", thumb: "https://i.ytimg.com/vi/WR3pCWO678s/hqdefault.jpg" },
    { id: "f4", title: "계획만 남은 주말 여름 오후를 담은 감성 발라드 플레이리스트 | fromy", videoId: "gHEaJgBO-4M", thumb: "https://i.ytimg.com/vi/gHEaJgBO-4M/hqdefault.jpg" },
    { id: "f5", title: "오늘도 퇴근했어요. | 감성 발라드 플레이리스트 | fromy", videoId: "_YBj7AOUAm8", thumb: "https://i.ytimg.com/vi/_YBj7AOUAm8/hqdefault.jpg" },
  ] as YoutubeVideo[],

  numbers: {
    eyebrow: "NUMBERS",
    title: "SO FAR.",
    stats: [
      { value: "5", label: "런칭한 프로젝트" },
      { value: "120+", label: "발행한 트랙" },
      { value: "2~4", label: "평균 제작 주수" },
      { value: "1", label: "만드는 사람" },
    ],
  },

  contact: {
    eyebrow: "CONTACT",
    title: "LET'S BUILD TOGETHER.",
    body:
      "새로운 브랜드를 만들거나, 기존 프로젝트를 발전시키고 싶다면 언제든 편하게 이야기해 주세요.",
    kakaoLabel: "카카오톡으로 문의",
    emailLabel: "메일 보내기",
    note: "평일 기준 하루 안에 답장드립니다.",
    services: [
      { title: "브랜드 홈페이지", body: "한 페이지부터 다섯 페이지까지. 모바일 우선." },
      { title: "웹 서비스", body: "로그인, 결제, AI 기능이 붙는 서비스." },
      { title: "콘텐츠 · 음악", body: "채널 세팅, 썸네일 시스템, BPM 트랙 제작." },
    ],
  },

  footer: {
    note: "DIGITAL MIND STUDIO",
  },

  /** 편집 모드에서 개별 텍스트에 준 크기 · 행간 · 정렬 오버라이드. */
  textStyles: {} as Record<string, TextStyle>,

  /** 편집 모드에서 섹션(파트)마다 준 위·아래 여백 오버라이드. */
  sectionSpacing: {} as Record<string, SectionSpacing>,
};
