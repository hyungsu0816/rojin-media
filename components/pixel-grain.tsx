"use client";

import { useEffect, useRef } from "react";

const UPDATE_EVERY = 3; // 매 프레임 갱신하면 어지러워서 3프레임에 한 번만

/** 화면 크기에 따른 알갱이 설정.
 * 폰은 화면이 물리적으로 작고 밝기·주변광 영향도 커서, PC와 똑같은 값으로는
 * 알갱이가 거의 안 보입니다. 그래서 좁은 화면에서만 조금 더 크고 진하게 씁니다.
 * (PC 값은 기존에 맞춰둔 그대로입니다) */
function grainSettings() {
  const w = typeof window === "undefined" ? 1280 : window.innerWidth;
  if (w < 640) {
    // 이전 값(alphaMin 14, alphaRange 30)의 약 40% 투명도로 낮춘 값입니다.
    return { pixel: 3, chance: 0.07, alphaMin: 6, alphaRange: 12 };
  }
  return { pixel: 2, chance: 0.05, alphaMin: 8, alphaRange: 18 };
}

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

    // "동작 줄이기(prefers-reduced-motion)"가 켜져 있으면 예전에는 여기서 그냥 빠져나가서
    // 배경이 아예 안 그려졌습니다 — 폰에서 이 설정을 켜둔 분들에게는 배경이 통째로
    // 없는 것처럼 보였습니다. 동작을 줄이라는 것이지 없애라는 뜻은 아니므로,
    // 이 경우에는 애니메이션만 멈추고 정지된 알갱이는 한 번 그려둡니다.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = canvas.getContext("2d");
    const buffer = document.createElement("canvas");
    const bctx = buffer.getContext("2d");
    if (!ctx || !bctx) return;

    let cols = 0;
    let rows = 0;
    let settings = grainSettings();

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
      settings = grainSettings();
      cols = Math.max(1, Math.ceil(cssW / settings.pixel));
      rows = Math.max(1, Math.ceil(cssH / settings.pixel));
      buffer.width = cols;
      buffer.height = rows;
    };
    resize();

    let raf = 0;
    let frame = 0;

    const paint = () => {
      const { chance, alphaMin, alphaRange } = settings;
      const data = bctx.createImageData(cols, rows);
      for (let i = 0; i < cols * rows; i += 1) {
        const o = i * 4;
        const on = Math.random() < chance;
        const v = 200 + Math.random() * 55; // 밝은 회색~흰색만 사용
        data.data[o] = v;
        data.data[o + 1] = v;
        data.data[o + 2] = v;
        data.data[o + 3] = on ? alphaMin + Math.random() * alphaRange : 0;
      }
      bctx.putImageData(data, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
    };

    // 크기가 바뀌면 캔버스 버퍼가 비워집니다. 움직이는 모드는 다음 프레임에 어차피
    // 다시 그리지만, 정지 모드에서는 여기서 다시 그려주지 않으면 배경이 사라집니다.
    const handleResize = () => {
      resize();
      if (reduceMotion) paint();
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(canvas);
    window.addEventListener("resize", handleResize);

    if (reduceMotion) {
      paint();
    } else {
      const render = () => {
        frame += 1;
        if (frame % UPDATE_EVERY === 0) paint();
        raf = requestAnimationFrame(render);
      };
      raf = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
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
