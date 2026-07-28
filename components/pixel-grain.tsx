"use client";

import { useEffect, useRef } from "react";

const PIXEL = 2; // 화면에 보이는 픽셀 한 알의 크기(px) — 최대한 잘게
const UPDATE_EVERY = 3; // 매 프레임 갱신하면 어지러워서 3프레임에 한 번만
const FLICKER_CHANCE = 0.05; // 그 프레임에 반짝일 픽셀 비율 — 아주 드문드문

/** 검은 배경 위에서 아주 은은하게 반짝이는 흑백 픽셀 그레인.
 * back_em.html 레퍼런스의 "파란 그라디언트"는 빼고, 노이즈 알갱이가
 * 움직이는 부분만 이 사이트 톤(다크·모노톤)에 맞게 가볍게 다시 만들었습니다.
 * Three.js/WebGL 없이 2D 캔버스로, 저해상도 버퍼를 확대해서 그립니다.
 *
 * 뷰포트에 고정되는 게 아니라 감싸는 부모(부모의 height 만큼만) 안에서만 그려지고,
 * 아래쪽은 mask로 자연스럽게 투명해집니다 — 메인 1·2 파트에서만 보이다가 사라지도록. */
export function PixelGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    const buffer = document.createElement("canvas");
    const bctx = buffer.getContext("2d");
    if (!ctx || !bctx) return;

    let cols = 0;
    let rows = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(rect.height));

      // 폰·레티나 화면(devicePixelRatio 2~3)에서 CSS 픽셀 크기로만 그리면,
      // 브라우저가 그 비트맵을 흐릿하게 늘려서 알갱이가 뭉개집니다.
      // 알갱이 자체가 워낙 옅어서(알파 최대 26/255) 늘어나는 순간 거의 안 보이게 됩니다.
      // 그래서 실제 화면 해상도만큼 그리고, 확대는 아래 imageSmoothingEnabled = false 로
      // 또렷하게 처리합니다. 다만 iOS 는 캔버스 한 변이 너무 길면 아예 못 그리므로 상한을 둡니다.
      const MAX_SIDE = 4096;
      let dpr = Math.min(window.devicePixelRatio || 1, 2);
      dpr = Math.min(dpr, MAX_SIDE / cssW, MAX_SIDE / cssH);
      dpr = Math.max(1, dpr);

      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);

      // 알갱이 격자는 CSS 크기 기준으로 유지해서, 화면이 달라져도 보이는 크기는 같게 합니다.
      cols = Math.max(1, Math.ceil(cssW / PIXEL));
      rows = Math.max(1, Math.ceil(cssH / PIXEL));
      buffer.width = cols;
      buffer.height = rows;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("resize", resize);

    let raf = 0;
    let frame = 0;

    const render = () => {
      frame += 1;
      if (frame % UPDATE_EVERY === 0) {
        const data = bctx.createImageData(cols, rows);
        for (let i = 0; i < cols * rows; i += 1) {
          const o = i * 4;
          const on = Math.random() < FLICKER_CHANCE;
          const v = 200 + Math.random() * 55; // 밝은 회색~흰색만 사용
          data.data[o] = v;
          data.data[o + 1] = v;
          data.data[o + 2] = v;
          data.data[o + 3] = on ? 8 + Math.random() * 18 : 0; // 아주 낮은 불투명도
        }
        bctx.putImageData(data, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      style={{
        maskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
      }}
    />
  );
}
