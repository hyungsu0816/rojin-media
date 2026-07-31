import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const alt = "rojin_media — 웹사이트, 브랜드 콘텐츠, 음악까지 한 사람이 만듭니다.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 카카오톡 등에 링크를 붙여넣을 때 뜨는 미리보기 카드 이미지입니다.
// 정적 파일 대신 이 라우트로 만들어두면 사이트 톤(다크 · Pretendard)에 맞춰
// 코드로 계속 고칠 수 있습니다. Satori(ImageResponse)는 브라우저 폰트를 못 쓰므로
// 한글 표시를 위해 Pretendard 폰트 파일을 직접 읽어 넣습니다.
export default async function Image() {
  const [bold, regular] = await Promise.all([
    readFile(join(process.cwd(), "app/fonts/Pretendard-Bold.ttf")),
    readFile(join(process.cwd(), "app/fonts/Pretendard-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08090a",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 28px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.16)",
            color: "rgba(255,255,255,0.6)",
            fontFamily: "PretendardR",
            fontSize: 22,
            letterSpacing: 6,
          }}
        >
          DIGITAL MIND STUDIO
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            fontFamily: "PretendardB",
            fontSize: 116,
            color: "#f4f4f5",
            letterSpacing: -3,
          }}
        >
          rojin_media
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontFamily: "PretendardR",
            fontSize: 32,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          웹사이트, 브랜드 콘텐츠, 음악까지 한 사람이 만듭니다.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "PretendardB", data: bold, weight: 700, style: "normal" },
        { name: "PretendardR", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
