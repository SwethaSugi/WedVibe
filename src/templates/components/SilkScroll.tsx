"use client";

import type { InvitationData } from "@/lib/invitation-types";
import { InvitationBody, PhotoHero, useOpening, rootClip, COVER_HEIGHT, coupleNames, nameSize, type InviteTheme } from "../shared/InvitationBody";
import { parseDate, monthName } from "../invite-utils";

// Kumkum-red radial foil with a gold label, like the original kumkum scratch.
function paintKumkum(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) / 1.4);
  g.addColorStop(0, "#dc2626");
  g.addColorStop(0.6, "#991b1b");
  g.addColorStop(1, "#450a0a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(252,211,77,0.25)";
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#fde68a";
  ctx.font = "600 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✦  SCRATCH TO REVEAL THE DATE  ✦", w / 2, h / 2);
}

const theme: InviteTheme = {
  section: "bg-gradient-to-b from-[#3b0a0a] via-[#310808] to-[#2a0808]",
  text: "text-amber-50",
  muted: "text-amber-200/70",
  accent: "text-amber-300",
  heading: "font-ss-display text-[#fde68a]",
  body: "font-ss-body",
  card: "rounded-2xl bg-[#4a0c0c]/70 border border-amber-400/40 shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  divider: "border-amber-400/30",
  button: "inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-[#2a0808] text-xs font-bold uppercase tracking-wider hover:brightness-110 transition",
  ghostButton: "inline-block px-5 py-2.5 rounded-full border border-amber-400/60 text-amber-200 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition",
  countBox: "rounded-xl bg-[#200505] border border-amber-400/40",
  countNumber: "font-ss-display text-amber-300",
  scratchSurface: "bg-black/60 border-2 border-amber-400/60",
  scratchPaint: paintKumkum,
  gallery: "grid",
};

/**
 * SilkScroll — Traditional.
 * A rolled silk scroll tied with a golden ribbon: the ribbon falls away and the scroll unrolls
 * to reveal the invitation, in kumkum red, silk and gold.
 */
export function SilkScroll({ data }: { data: InvitationData }) {
  const { groom, bride } = coupleNames(data);
  const { opened, gone, open } = useOpening(1900);
  const photo = data.coupleImage || data.brideImage || data.groomImage;
  const date = parseDate(data.weddingDate);

  return (
    <div className={`relative w-full bg-[#2a0808] text-white antialiased ${rootClip(gone)}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rozha+One&family=Marcellus&display=swap');
        .font-ss-display { font-family: 'Rozha One', serif; }
        .font-ss-body { font-family: 'Marcellus', serif; }
        @keyframes ss-pulse { 0%, 100% { filter: drop-shadow(0 0 12px rgba(245,158,11,0.4)); } 50% { filter: drop-shadow(0 0 26px rgba(234,88,12,0.7)); } }
        @keyframes ss-sway { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
        .ss-pulse { animation: ss-pulse 3.5s ease-in-out infinite; }
        .ss-sway { transform-origin: top center; animation: ss-sway 3s ease-in-out infinite; }
        .ss-paper { transform-origin: top center; transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1) .45s; }
        .ss-ribbon { transition: transform .6s ease-in, opacity .6s ease-in; }
        .ss-silk { background: linear-gradient(90deg, #b45309, #e11d48 30%, #f59e0b 50%, #e11d48 70%, #b45309); }
        @media (prefers-reduced-motion: reduce) { .ss-pulse, .ss-sway { animation: none !important; } }
      `}</style>

      {/* ===== Opening: silk scroll ===== */}
      {!gone && (
        <div
          className={`absolute inset-x-0 top-0 ${COVER_HEIGHT} z-40 overflow-hidden flex flex-col items-center justify-center text-center px-6 bg-[radial-gradient(ellipse_at_center,_#4c0d0d_0%,_#2a0808_70%)] transition-opacity duration-500 delay-[1500ms] ${opened ? "opacity-0 pointer-events-none" : ""}`}
        >
          <span className="text-3xl">🪔</span>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#fde68a] font-ss-body">With the blessings of the Almighty</p>

          <button type="button" onClick={open} aria-label="Untie the ribbon to open the invitation" className="ss-pulse relative mt-8 w-64">
            {/* Top roller */}
            <div className="ss-silk relative z-10 h-9 rounded-full border-2 border-amber-300 shadow-xl" />
            {/* Unrolling parchment */}
            <div
              className="ss-paper -mt-3 mx-3 rounded-b-lg bg-[linear-gradient(180deg,#fff8e7,#f7e7c3)] border-x-2 border-b-2 border-amber-400 overflow-hidden"
              style={{ transform: opened ? "scaleY(1)" : "scaleY(0.12)", height: 260 }}
            >
              <div className="h-full flex flex-col items-center justify-center px-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#9a3412] font-ss-body">Wedding Invitation</p>
                <p className="font-ss-display text-2xl text-[#7f1d1d] mt-2 leading-tight">{groom}</p>
                <p className="font-ss-body text-[#b45309]">&amp;</p>
                <p className="font-ss-display text-2xl text-[#7f1d1d] leading-tight">{bride}</p>
              </div>
            </div>
            {/* Bottom roller: follows the paper down as it unrolls */}
            <div
              className="ss-silk relative z-10 h-9 -mt-3 rounded-full border-2 border-amber-300 shadow-xl transition-transform duration-[1200ms] delay-[450ms]"
              style={{ transform: opened ? "none" : "translateY(-228px)" }}
            />
            {/* Golden ribbon + tassels */}
            <div
              className="ss-ribbon absolute left-1/2 top-3 -translate-x-1/2 z-20 flex flex-col items-center"
              style={{ transform: opened ? "translate(-50%, 120px) rotate(25deg)" : undefined, opacity: opened ? 0 : 1 }}
              aria-hidden
            >
              <div className="w-3 h-12 bg-gradient-to-b from-amber-300 to-amber-500 rounded-sm" />
              <div className="ss-sway flex gap-4">
                <span className="w-2 h-7 rounded-b-full bg-gradient-to-b from-amber-400 to-[#b45309]" />
                <span className="w-2 h-7 rounded-b-full bg-gradient-to-b from-amber-400 to-[#b45309]" />
              </div>
            </div>
          </button>

          <p className={`font-ss-display ${nameSize(`${groom} ${bride}`, ["text-xl", "text-2xl", "text-3xl"])} text-[#fde68a] mt-6`}>
            {groom} &amp; {bride}
          </p>
          <span className="mt-5 px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-[#2a0808] text-xs font-bold uppercase tracking-[0.2em]">
            Untie the Ribbon
          </span>
          <p className="mt-3 text-[11px] font-ss-body text-amber-200/60">Tap the scroll to unroll our invitation</p>
        </div>
      )}

      {/* ===== Hero ===== */}
      <PhotoHero
        photo={photo}
        alt={`${groom} and ${bride}`}
        overlay="bg-gradient-to-t from-[#3b0a0a] via-[#3b0a0a]/55 to-transparent"
        fallback="bg-[radial-gradient(ellipse_at_top,_#7f1d1d_0%,_#4c0d0d_55%,_#3b0a0a_100%)]"
        imgClassName="brightness-[0.75] contrast-[1.1]"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-amber-300 font-ss-body">Wedding Invitation</p>
        <h1 className={`font-ss-display ${nameSize(groom)} text-[#fde68a] mt-2 leading-tight drop-shadow-md`}>{groom}</h1>
        <p className="font-ss-body italic text-xl text-amber-300 my-1">weds</p>
        <h1 className={`font-ss-display ${nameSize(bride)} text-[#fde68a] leading-tight drop-shadow-md`}>{bride}</h1>
        {date && (
          <p className="mt-5 inline-block px-5 py-1.5 rounded-full bg-black/50 border border-amber-400/40 text-sm text-amber-200 font-ss-body">
            {date.getDate()} {monthName(date)} {date.getFullYear()}
          </p>
        )}
      </PhotoHero>

      <InvitationBody
        data={data}
        theme={theme}
        labels={{ scratchTitle: "The Auspicious Day", scratchHint: "Gently scratch the kumkum to reveal the date", eventsTitle: "Wedding Ceremonies", closingLine: "Awaiting your gracious presence" }}
      />
    </div>
  );
}
