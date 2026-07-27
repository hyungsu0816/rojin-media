import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "content", "site-data.json");

/** 지금 디스크에 저장된 내용을 그대로 돌려줍니다.
 * content/site.ts 는 이 파일을 import 하지 않고(그러면 저장할 때마다
 * 개발 서버가 페이지를 리로드해서 편집 모드가 꺼집니다), 브라우저가
 * 켜질 때 이 GET 을 fetch 해서 최신 저장본을 가져옵니다.
 *
 * 파일에는 { updatedAt, content } 형태로 저장 시각을 같이 적어둡니다.
 * 이 시각이 없으면(예전 형식 파일) 0 으로 취급해, 브라우저 localStorage 쪽이
 * 더 최근이면 그쪽이 이기도록 합니다 — "방금 한 편집이 저장 중(디바운스 대기)일 때
 * 새로고침하면 옛날 디스크 내용이 덮어써서 롤백되는" 문제를 막기 위함입니다. */
export async function GET() {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const hasWrapper = parsed && typeof parsed === "object" && "content" in parsed && "updatedAt" in parsed;
    const updatedAt = hasWrapper ? parsed.updatedAt : 0;
    const content = hasWrapper ? parsed.content : parsed;
    return NextResponse.json({ ok: true, updatedAt, content });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}

/** 편집 모드의 저장을 브라우저 localStorage 뿐 아니라
 * content/site-data.json 파일에도 그대로 기록합니다. 배포 환경(프로덕션)에서는
 * 파일 시스템이 읽기 전용이라 저장하지 않고 에러를 돌려줍니다.
 *
 * sendBeacon 으로도 호출되므로(페이지를 닫거나 이동할 때) Content-Type 이
 * application/json 이 아닐 수 있습니다 — request.text() 로 받아 직접 JSON.parse 합니다. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { ok: false, error: "배포된 사이트에서는 파일로 저장할 수 없습니다. 로컬 개발 서버에서만 동작합니다." },
      { status: 403 },
    );
  }

  try {
    const raw = await request.text();
    const body = JSON.parse(raw);
    const updatedAt: number = typeof body.updatedAt === "number" ? body.updatedAt : Date.now();
    const content = body.content;

    try {
      const prevRaw = await readFile(DATA_PATH, "utf-8");
      const prev = JSON.parse(prevRaw);
      const prevUpdatedAt = prev && typeof prev === "object" && "updatedAt" in prev ? prev.updatedAt : 0;
      if (prevUpdatedAt > updatedAt) {
        // 디스크에 이미 이보다 더 최근 저장본이 있으면(다른 탭 등) 되돌리지 않습니다.
        return NextResponse.json({ ok: true, skipped: true });
      }
    } catch {
      // 기존 파일이 없거나 깨졌으면 그냥 새로 씁니다.
    }

    await writeFile(
      DATA_PATH,
      `${JSON.stringify({ updatedAt, content }, null, 2)}\n`,
      "utf-8",
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "저장 실패" },
      { status: 500 },
    );
  }
}
