"use client";

import { useEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";

/**
 * A scratch-off layer drawn on a canvas over `children`. Guests rub it away with a finger or
 * mouse; once enough is cleared it fades out. Enter/Space reveals it for keyboard users.
 * `paint` draws the cover (in CSS pixels) whenever the card is (re)laid out.
 */
export function ScratchCover({
  children,
  paint,
  className = "",
  ariaLabel,
  brush = 22,
  threshold = 0.45,
}: {
  children: ReactNode;
  paint: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  className?: string;
  ariaLabel: string;
  brush?: number;
  threshold?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratching = useRef(false);
  const moves = useRef(0);
  const [revealed, setRevealed] = useState(false);
  // Keep the latest painter in a ref: parents re-render every second (countdowns), and a new
  // `paint` identity must not repaint the cover mid-scratch.
  const paintRef = useRef(paint);
  paintRef.current = paint;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || revealed) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    paintRef.current(ctx, rect.width, rect.height);
  }, [revealed]);

  function checkCleared() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !canvas.width) return;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      total++;
      if (data[i] === 0) clear++;
    }
    if (total && clear / total > threshold) setRevealed(true);
  }

  function scratchAt(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const r = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(e.clientX - r.left, e.clientY - r.top, brush, 0, Math.PI * 2);
    ctx.fill();
    if (++moves.current % 8 === 0) checkCleared();
  }

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      {children}
      <canvas
        ref={canvasRef}
        role="button"
        tabIndex={revealed ? -1 : 0}
        aria-label={ariaLabel}
        onPointerDown={(e) => {
          scratching.current = true;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          scratchAt(e);
        }}
        onPointerMove={(e) => scratching.current && scratchAt(e)}
        onPointerUp={() => {
          scratching.current = false;
          checkCleared();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setRevealed(true);
          }
        }}
        className={`absolute inset-0 w-full h-full touch-none cursor-pointer transition-opacity duration-700 ${
          revealed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />
    </div>
  );
}

// Scatters small light specks over a painted cover for a foil-like sparkle.
export function sprinkle(ctx: CanvasRenderingContext2D, w: number, h: number, count = 60, color = "rgba(255,255,255,0.35)") {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}
