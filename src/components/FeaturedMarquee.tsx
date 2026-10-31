"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Homepage featured templates: an endless right-to-left carousel that people can also move
// themselves. It pauses while hovered or touched; then visitors can swipe (touch), drag (mouse)
// or use the arrow buttons to go left or right. Auto-scrolling resumes shortly after.
// `children` must hold the card list twice (the second copy hidden from screen readers), so
// jumping back by exactly half the width loops seamlessly in either direction.
export function FeaturedMarquee({ children, speed = 40 }: { children: ReactNode; speed?: number }) {
  const scroller = useRef<HTMLDivElement>(null);
  const pos = useRef(0); // exact scroll position (scrollLeft itself can round to whole pixels)
  const hovering = useRef(false);
  const holdUntil = useRef(0); // stays paused until this time after a swipe/drag/arrow click
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      const paused = reduced || hovering.current || drag.current || now < holdUntil.current;
      if (!paused) {
        pos.current += speed * dt;
        const half = el.scrollWidth / 2;
        if (pos.current >= half) pos.current -= half;
        el.scrollLeft = pos.current;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [speed]);

  // Keep the loop endless when people scroll it themselves, and remember where they left it.
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    if (el.scrollLeft < 1) el.scrollLeft += half;
    else if (el.scrollLeft >= half * 2 - el.clientWidth - 1) el.scrollLeft -= half;
    if (Math.abs(el.scrollLeft - pos.current) > 2) pos.current = el.scrollLeft;
  };

  const hold = (ms = 2500) => {
    holdUntil.current = performance.now() + ms;
  };

  const step = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-marquee-card]");
    const width = card ? card.offsetWidth + parseFloat(getComputedStyle(card).marginRight || "0") : 320;
    hold(4000);
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  // Mouse drag (touch screens already swipe natively).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !scroller.current) return;
    drag.current = { x: e.clientX, start: scroller.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = scroller.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      el.setPointerCapture(e.pointerId);
    }
    if (d.moved) el.scrollLeft = d.start - dx;
  };
  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (d.moved) {
      scroller.current?.releasePointerCapture(e.pointerId);
      hold();
      // Let the click that follows a drag through to here, then cancel it (no accidental open).
      setTimeout(() => (drag.current = null), 0);
    } else {
      drag.current = null;
    }
  };

  const arrow =
    "hidden sm:flex absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 items-center justify-center rounded-full bg-white/90 text-[#5b1530] shadow-lg hover:bg-white hover:scale-105 active:scale-95 transition";

  return (
    <div
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && (hovering.current = true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && (hovering.current = false)}
      onFocus={() => (hovering.current = true)}
      onBlur={() => (hovering.current = false)}
    >
      <div
        ref={scroller}
        className="wv-marquee overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none"
        onScroll={onScroll}
        onTouchStart={() => hold(60_000)}
        onTouchEnd={() => hold()}
        onTouchCancel={() => hold()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => {
          if (drag.current?.moved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="flex w-max py-4">{children}</div>
      </div>
      <button type="button" aria-label="Previous templates" onClick={() => step(-1)} className={`${arrow} left-3 lg:left-6`}>
        <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12.5 4.5L7 10l5.5 5.5" />
        </svg>
      </button>
      <button type="button" aria-label="Next templates" onClick={() => step(1)} className={`${arrow} right-3 lg:right-6`}>
        <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M7.5 4.5L13 10l-5.5 5.5" />
        </svg>
      </button>
    </div>
  );
}
