"use client";

import type { InvitationData } from "@/lib/invitation-types";
import { InvitationBody, PhotoHero, useOpening, rootClip, COVER_HEIGHT, coupleNames, nameSize, type InviteTheme } from "../shared/InvitationBody";
import { parseDate, monthName } from "../invite-utils";

// Emerald-and-green striped tile with a gold label, like the original scratch tile.
function paintEmeraldTile(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#064e3b";
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#10b981";
  const span = Math.hypot(w, h);
  for (let x = -span; x < span; x += 20) ctx.fillRect(x, -span, 10, span * 2);
  ctx.restore();
  ctx.fillStyle = "#f5d77f";
  ctx.beginPath();
  ctx.roundRect(w / 2 - 105, h / 2 - 16, 210, 32, 16);
  ctx.fill();
  ctx.fillStyle = "#051c15";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SCRATCH THE EMERALD TILE", w / 2, h / 2);
}

const theme: InviteTheme = {
  section: "bg-gradient-to-b from-[#0b2c22] via-[#08231b] to-[#051c15]",
  text: "text-emerald-50",
  muted: "text-emerald-200/75",
  accent: "text-[#f5d77f]",
  heading: "font-nv-display text-[#f5d77f]",
  body: "font-nv-body",
  card: "rounded-2xl bg-[#0f382c]/75 border border-[#f5d77f]/35 shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  divider: "border-[#f5d77f]/25",
  button: "inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#f5d77f] to-[#d4af37] text-[#051c15] text-xs font-bold uppercase tracking-wider hover:brightness-110 transition",
  ghostButton: "inline-block px-5 py-2.5 rounded-full border border-[#f5d77f]/60 text-[#f5d77f] text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition",
  countBox: "rounded-xl bg-[#031812] border border-[#f5d77f]/30",
  countNumber: "font-nv-display text-[#f5d77f]",
  scratchSurface: "bg-black/60 border-2 border-[#f5d77f]/60",
  scratchPaint: paintEmeraldTile,
  gallery: "grid",
};

/**
 * RoyalNikahVault — Muslim Wedding.
 * An emerald jewelled chest with a gold lattice: the golden key turns, the lid lifts and the
 * Nikah invitation opens in emerald and gold.
 */
export function RoyalNikahVault({ data }: { data: InvitationData }) {
  const { groom, bride } = coupleNames(data);
  const { opened, gone, open } = useOpening(1700);
  const photo = data.coupleImage || data.brideImage || data.groomImage;
  const date = parseDate(data.weddingDate);

  return (
    <div className={`relative w-full bg-[#051c15] text-white antialiased ${rootClip(gone)}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@600;700&display=swap');
        .font-nv-display { font-family: 'Amiri', serif; }
        .font-nv-body { font-family: 'Cinzel', serif; }
        @keyframes nv-glow { 0%, 100% { filter: drop-shadow(0 0 10px rgba(245,215,127,0.4)); } 50% { filter: drop-shadow(0 0 24px rgba(245,215,127,0.85)); } }
        .nv-glow { animation: nv-glow 3s ease-in-out infinite; }
        .nv-key { transition: transform .6s ease; }
        .nv-lid { transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1) .5s, opacity 1s ease .5s; transform-origin: top center; }
        .nv-jali { background-image: radial-gradient(circle at 50% 50%, transparent 38%, rgba(245,215,127,0.35) 40%, transparent 44%); background-size: 22px 22px; }
        @media (prefers-reduced-motion: reduce) { .nv-glow { animation: none !important; } }
      `}</style>

      {/* ===== Opening: jewelled chest ===== */}
      {!gone && (
        <div
          className={`absolute inset-x-0 top-0 ${COVER_HEIGHT} z-40 overflow-hidden flex flex-col items-center justify-center text-center px-6 bg-[radial-gradient(ellipse_at_center,_#0a382a_0%,_#041b14_70%)] transition-opacity duration-500 delay-[1200ms] ${opened ? "opacity-0 pointer-events-none" : ""}`}
        >
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#f5d77f] font-nv-body leading-relaxed">
            In the name of Allah,
            <br />
            the Most Gracious, the Most Merciful
          </p>
          <p className={`font-nv-display ${nameSize(`${groom} ${bride}`, ["text-2xl", "text-3xl", "text-4xl"])} text-[#f5d77f] font-bold mt-5`}>
            {groom} &amp; {bride}
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 font-nv-body mt-1">Nikah Ceremony</p>

          <button type="button" onClick={open} aria-label="Turn the golden key to open the invitation" className="relative mt-10 mb-8 w-60 h-44" style={{ perspective: "900px" }}>
            {/* Chest body */}
            <div className="absolute bottom-0 inset-x-0 h-28 rounded-b-2xl bg-gradient-to-b from-[#0a382a] to-[#041b14] border-2 border-[#f5d77f]/70 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
              <div className="nv-jali absolute inset-2 rounded-xl opacity-80" />
              {/* Lock plate + key */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-14 rounded-lg bg-gradient-to-b from-[#f5d77f] to-[#b8912b] border border-[#fff3c4] flex items-center justify-center shadow-lg">
                <span className="nv-key nv-glow text-2xl" style={{ transform: opened ? "rotate(90deg)" : "none" }}>
                  🗝️
                </span>
              </div>
            </div>
            {/* Lid */}
            <div
              className="nv-lid absolute top-0 inset-x-0 h-16 rounded-t-[40px] bg-gradient-to-b from-[#10523f] to-[#0a382a] border-2 border-[#f5d77f]/70"
              style={{ transform: opened ? "rotateX(110deg) translateY(-10px)" : "none", opacity: opened ? 0 : 1 }}
            >
              <div className="nv-jali absolute inset-2 rounded-t-[34px] opacity-70" />
            </div>
          </button>

          <span className="px-6 py-2 rounded-full bg-[#031510] border border-[#f5d77f]/70 text-xs font-nv-body font-bold text-[#f5d77f] tracking-[0.2em] uppercase">
            Turn the Golden Key
          </span>
          <p className="mt-3 text-[11px] text-emerald-200/70 font-nv-body">Tap the chest to open our invitation</p>
        </div>
      )}

      {/* ===== Hero ===== */}
      <PhotoHero
        photo={photo}
        alt={`${groom} and ${bride}`}
        overlay="bg-gradient-to-t from-[#0b2c22] via-[#0b2c22]/50 to-transparent"
        fallback="bg-[radial-gradient(ellipse_at_top,_#0f5b46_0%,_#0b2c22_55%,_#051c15_100%)]"
        imgClassName="brightness-[0.75] contrast-[1.1]"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#f5d77f] font-nv-body font-bold">Nikah Ceremony</p>
        <h1 className={`font-nv-display ${nameSize(groom)} text-[#f5d77f] mt-2 leading-tight`}>{groom}</h1>
        <p className="font-nv-display italic text-2xl text-emerald-200 my-1">&amp;</p>
        <h1 className={`font-nv-display ${nameSize(bride)} text-[#f5d77f] leading-tight`}>{bride}</h1>
        {date && (
          <p className="mt-5 text-xs tracking-[0.3em] text-emerald-100 font-nv-body">
            {date.getDate()} {monthName(date).toUpperCase()} {date.getFullYear()}
          </p>
        )}
      </PhotoHero>

      <InvitationBody
        data={data}
        theme={theme}
        labels={{ scratchTitle: "The Nikah Date", scratchHint: "Scratch the emerald tile to reveal the date", eventsTitle: "Wedding Celebrations", closingLine: "May Allah bless this union" }}
      />
    </div>
  );
}
