"use client";

import type { InvitationData } from "@/lib/invitation-types";
import { InvitationBody, PhotoHero, useOpening, rootClip, COVER_HEIGHT, coupleNames, nameSize, type InviteTheme } from "../shared/InvitationBody";
import { parseDate, monthName } from "../invite-utils";

// Candy-striped rose-gold foil, like the original petal shimmer.
function paintPetalFoil(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#fb7185";
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#fecdd3";
  const span = Math.hypot(w, h);
  for (let x = -span; x < span; x += 20) ctx.fillRect(x, -span, 10, span * 2);
  ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.roundRect(w / 2 - 110, h / 2 - 16, 220, 32, 16);
  ctx.fill();
  ctx.fillStyle = "#881337";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SCRATCH THE ROSE PETAL", w / 2, h / 2);
}

const theme: InviteTheme = {
  section: "bg-gradient-to-b from-[#243029] via-[#212b25] to-[#1f2722]",
  text: "text-[#f3efe6]",
  muted: "text-[#a7b9af]",
  accent: "text-[#e8c5a5]",
  heading: "font-pb-display text-[#ffe4e6]",
  body: "font-pb-body",
  card: "rounded-3xl bg-[#2d3a32]/80 border border-[#e8c5a5]/30 shadow-[0_12px_40px_rgba(0,0,0,0.3)]",
  divider: "border-[#e8c5a5]/30",
  button: "inline-block px-5 py-2.5 rounded-full bg-[#e8c5a5] text-[#1f2722] text-xs font-semibold uppercase tracking-wider hover:brightness-105 transition",
  ghostButton: "inline-block px-5 py-2.5 rounded-full border border-[#e8c5a5]/60 text-[#e8c5a5] text-xs font-semibold uppercase tracking-wider hover:bg-white/5 transition",
  countBox: "rounded-2xl bg-[#1b241f] border border-[#e8c5a5]/30",
  countNumber: "font-pb-display text-[#e8c5a5]",
  scratchSurface: "bg-[#1b241f] border-2 border-[#e8c5a5]/60",
  scratchPaint: paintPetalFoil,
  gallery: "grid",
};

const PETALS = Array.from({ length: 8 }, (_, i) => i * 45);

/**
 * PaperBlossom — Floral.
 * Eight folded paper petals around a rose bud; tapping unfolds them outward and the invitation
 * blooms open in sage green, blush and rose gold.
 */
export function PaperBlossom({ data }: { data: InvitationData }) {
  const { groom, bride } = coupleNames(data);
  const { opened, gone, open } = useOpening(1400);
  const photo = data.coupleImage || data.brideImage || data.groomImage;
  const date = parseDate(data.weddingDate);

  return (
    <div className={`relative w-full bg-[#1f2722] text-white antialiased ${rootClip(gone)}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Alex+Brush&family=Plus+Jakarta+Sans:wght@300;400;600&display=swap');
        .font-pb-display { font-family: 'Playfair Display', serif; }
        .font-pb-script { font-family: 'Alex Brush', cursive; }
        .font-pb-body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        @keyframes pb-breathe { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.06) rotate(4deg); } }
        @keyframes pb-drift { 0% { transform: translateY(0) rotate(0); opacity: 0; } 20% { opacity: .7; } 100% { transform: translateY(640px) rotate(200deg); opacity: 0; } }
        .pb-breathe { animation: pb-breathe 4s ease-in-out infinite; }
        .pb-drift { animation: pb-drift linear infinite; }
        .pb-petal { transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.2s ease; }
        @media (prefers-reduced-motion: reduce) { .pb-breathe, .pb-drift { animation: none !important; } }
      `}</style>

      {/* ===== Opening: origami blossom ===== */}
      {!gone && (
        <div
          className={`absolute inset-x-0 top-0 ${COVER_HEIGHT} z-40 overflow-hidden flex flex-col items-center justify-center text-center px-6 bg-[radial-gradient(ellipse_at_center,_#2e3c34_0%,_#1f2722_70%)] transition-opacity duration-700 delay-700 ${opened ? "opacity-0 pointer-events-none" : ""}`}
        >
          {[12, 30, 55, 78, 90].map((x, i) => (
            <span key={x} className="pb-drift absolute top-0 text-lg text-[#fda4af]/50" style={{ left: `${x}%`, animationDuration: `${9 + i * 2}s`, animationDelay: `${i * 1.5}s` }} aria-hidden>
              ✿
            </span>
          ))}
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#e8c5a5] font-pb-body font-semibold">You are warmly invited</p>
          <p className={`font-pb-display ${nameSize(`${groom} ${bride}`, ["text-2xl", "text-3xl", "text-4xl"])} text-[#ffe4e6] mt-3 font-semibold`}>
            {groom} &amp; {bride}
          </p>

          <button type="button" onClick={open} aria-label="Tap the blossom to open the invitation" className="relative my-10 w-56 h-56 flex items-center justify-center">
            {PETALS.map((deg) => (
              <span
                key={deg}
                className="pb-petal absolute w-20 h-20 rounded-[70%_0_70%_0] bg-gradient-to-br from-[#fda4af] via-[#fb7185] to-[#be123c] border border-white/60 shadow-lg"
                style={{
                  transform: `rotate(${deg}deg) translateY(${opened ? -170 : -42}px) rotate(45deg) scale(${opened ? 0.6 : 1})`,
                  opacity: opened ? 0 : 0.92,
                }}
                aria-hidden
              />
            ))}
            <span className={`pb-breathe relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#be123c] via-[#fb7185] to-[#fda4af] border-2 border-white shadow-2xl flex items-center justify-center text-4xl transition-transform duration-700 ${opened ? "scale-0" : ""}`}>
              🌸
            </span>
          </button>

          <span className="px-5 py-2 rounded-full bg-[#18221d] border border-[#e8c5a5] text-xs font-pb-body font-semibold text-[#e8c5a5] tracking-[0.2em] uppercase">
            Tap the blossom
          </span>
          <p className="mt-3 text-[11px] font-pb-body text-[#a7b9af]">Unfold the petals to view our invitation</p>
        </div>
      )}

      {/* ===== Hero ===== */}
      <PhotoHero
        photo={photo}
        alt={`${groom} and ${bride}`}
        overlay="bg-gradient-to-t from-[#243029] via-[#243029]/50 to-transparent"
        fallback="bg-[radial-gradient(ellipse_at_top,_#3e5447_0%,_#2a3830_55%,_#243029_100%)]"
        imgClassName="brightness-[0.75] contrast-[1.05]"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] font-pb-body text-[#e8c5a5] font-semibold">Together with joyful hearts</p>
        <h1 className={`font-pb-display ${nameSize(groom)} text-[#ffe4e6] mt-2 leading-tight`}>{groom}</h1>
        <p className="font-pb-script text-4xl text-[#e8c5a5] my-1">and</p>
        <h1 className={`font-pb-display ${nameSize(bride)} text-[#ffe4e6] leading-tight`}>{bride}</h1>
        {date && (
          <p className="mt-5 text-sm tracking-[0.2em] text-[#e8c5a5] font-pb-body">
            {date.getDate()} {monthName(date)} {date.getFullYear()}
          </p>
        )}
      </PhotoHero>

      <InvitationBody
        data={data}
        theme={theme}
        labels={{ scratchTitle: "The Wedding Day", scratchHint: "Scratch the rose petal to reveal the date", closingLine: "With infinite love" }}
      />
    </div>
  );
}
