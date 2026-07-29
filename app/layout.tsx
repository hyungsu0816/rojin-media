import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ContentProvider } from "@/components/content-provider";
import { EditorBar } from "@/components/editor/editor-bar";
import { YoutubeMuteProvider } from "@/components/youtube-mute";

export const metadata: Metadata = {
  title: "rojin_media — 기획부터 배포까지",
  description:
    "웹사이트, 브랜드 콘텐츠, 음악까지 한 사람이 만드는 서울의 AI 크리에이티브 스튜디오.",
  openGraph: {
    title: "rojin_media",
    description: "웹사이트, 브랜드 콘텐츠, 음악까지 한 사람이 만듭니다.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ContentProvider>
          <YoutubeMuteProvider>
            {children}
            <EditorBar />
          </YoutubeMuteProvider>
        </ContentProvider>
      </body>
    </html>
  );
}
