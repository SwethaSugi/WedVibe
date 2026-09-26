"use client";

import type { InvitationData } from "@/lib/invitation-types";
import { InvitationBody, PhotoHero, useOpening, rootClip, COVER_HEIGHT, coupleNames, nameSize, foilPainter, type InviteTheme } from "../shared/InvitationBody";
import { parseDate, monthName } from "../invite-utils";

const theme: InviteTheme = {
  section: "bg-gradient-to-b from-[#38080c] via-[#2c0609] to-[#240507]",
  text: "text-amber-50",
  muted: "text-amber-200/75",
  accent: "text-amber-300",
  heading: "font-tc-display text-[#fde68a]",
  body: "font-tc-body",
  card: "rounded-2xl bg-[#4a0a10]/70 border border-amber-500/35 shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  divider: "border-amber-500/30",
  button: "inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-[#240507] text-xs font-bold uppercase tracking-wider hover:brightness-110 transition",
  ghostButton: "inline-block px-5 py-2.5 rounded-full border border-amber-400/60 text-amber-200 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition",
  countBox: "rounded-xl bg-[#200406] border border-amber-500/40",
  countNumber: "font-tc-display text-amber-300",
  scratchSurface: "bg-black/80 border-2 border-amber-400/60",
  scratchPaint: foilPainter(["#f59e0b", "#b91c1c", "#7f1d1d"], "✦  SCRATCH THE SANDALWOOD  ✦", "#fef3c7"),
  gallery: "grid",
};

const GARLAND = Array.from({ length: 9 }, (_, i) => i);

/**
 * TempleCurtains — South Indian / Traditional.
 * Pleated maroon silk temple curtains with swaying marigold garlands part to reveal the couple,
 * followed by the shared invitation body in maroon and temple gold.
 */
export function TempleCurtains({ data }: { data: InvitationData }) {
  const { groom, bride } = coupleNames(data);
  const { opened, gone, open } = useOpening(1600);
  const photo = data.coupleImage || data.brideImage || data.groomImage;
  const date = parseDate(data.weddingDate);

  return (
    <div className={`relative w-full bg-[#240507] text-white antialiased ${rootClip(gone)}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rozha+One&family=Marcellus&display=swap');
        .font-tc-display { font-family: 'Rozha One', serif; }
        .font-tc-body { font-family: 'Marcellus', serif; }
        @keyframes tc-sway { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
        @keyframes tc-flicker { 0%, 100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.12); opacity: 1; } }
        .tc-sway { transform-origin: top center; animation: tc-sway 3.2s ease-in-out infinite; }
        .tc-flicker { animation: tc-flicker 2s ease-in-out infinite; }
        .tc-curtain { transition: transform 1.5s cubic-bezier(0.77, 0, 0.18, 1); }
        .tc-pleats { background-image: repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 10px, rgba(255,255,255,0.05) 10px 22px, rgba(0,0,0,0.1) 22px 34px); }
        @media (prefers-reduced-motion: reduce) { .tc-sway, .tc-flicker { animation: none !important; } }
      `}</style>

      {/* ===== Opening: parting silk curtains ===== */}
      {!gone && (
        <div className={`absolute inset-x-0 top-0 ${COVER_HEIGHT} z-40 overflow-hidden ${opened ? "pointer-events-none" : ""}`}>
          <div className={`absolute inset-0 bg-[#150204] transition-opacity duration-500 delay-1000 ${opened ? "opacity-0" : ""}`} />
          {(["left", "right"] as const).map((side) => (
            <div
              key={side}
              className={`tc-curtain tc-pleats absolute top-0 bottom-0 w-1/2 ${side === "left" ? "left-0 border-r-2 bg-gradient-to-r" : "right-0 border-l-2 bg-gradient-to-l"} from-[#590c12] via-[#781019] to-[#45070c] border-amber-400 shadow-2xl`}
              style={{ transform: opened ? `translateX(${side === "left" ? "-100%" : "100%"})` : "none" }}
              aria-hidden
            />
          ))}
          {/* Marigold garland along the top */}
          <div className={`absolute top-0 inset-x-0 flex justify-around px-2 transition-opacity duration-500 ${opened ? "opacity-0" : ""}`} aria-hidden>
            {GARLAND.map((i) => (
              <div key={i} className="tc-sway flex flex-col items-center" style={{ animationDelay: `${(i % 3) * 0.4}s` }}>
                <div className="w-px h-6 bg-amber-300/70" />
                <span className="w-4 h-4 rounded-full bg-[radial-gradient(circle,#fcd34d,#f97316)]" />
                <span className="w-3.5 h-3.5 -mt-0.5 rounded-full bg-[radial-gradient(circle,#fde68a,#f59e0b)]" />
              </div>
            ))}
          </div>

          <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-opacity duration-500 ${opened ? "opacity-0" : ""}`}>
            <span className="tc-flicker text-4xl">🪔</span>
            <div className="mt-3 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 backdrop-blur-sm">
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#fde68a] font-tc-body">The auspicious wedding of</span>
            </div>
            <p className={`font-tc-display ${nameSize(groom, ["text-2xl", "text-3xl", "text-4xl"])} text-[#fde68a] mt-4 leading-tight`}>{groom}</p>
            <p className="font-tc-body italic text-xl text-amber-300">weds</p>
            <p className={`font-tc-display ${nameSize(bride, ["text-2xl", "text-3xl", "text-4xl"])} text-[#fde68a] leading-tight`}>{bride}</p>
            <button
              type="button"
              onClick={open}
              className="mt-7 px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-[#240507] text-xs font-bold uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition"
            >
              Open the Curtains
            </button>
            <p className="mt-3 text-[11px] font-tc-body text-amber-200/70">Tap to part the silk curtains</p>
          </div>
        </div>
      )}

      {/* ===== Hero ===== */}
      <PhotoHero
        photo={photo}
        alt={`${groom} and ${bride}`}
        overlay="bg-gradient-to-t from-[#38080c] via-[#38080c]/55 to-transparent"
        fallback="bg-[radial-gradient(ellipse_at_top,_#7f1d1d_0%,_#45070c_55%,_#38080c_100%)]"
        imgClassName="brightness-[0.75]"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-amber-300 font-tc-body">Wedding Celebration</p>
        <h1 className={`font-tc-display ${nameSize(groom)} text-[#fde68a] mt-2 leading-tight`}>{groom}</h1>
        <p className="font-tc-display text-xl text-amber-400 my-1">✦ weds ✦</p>
        <h1 className={`font-tc-display ${nameSize(bride)} text-[#fde68a] leading-tight`}>{bride}</h1>
        {date && (
          <p className="mt-5 inline-block px-5 py-1.5 rounded-full bg-black/50 border border-amber-400/40 text-sm text-amber-200 font-tc-body">
            {date.getDate()} {monthName(date)} {date.getFullYear()}
          </p>
        )}
      </PhotoHero>

      <InvitationBody
        data={data}
        theme={theme}
        labels={{ scratchTitle: "The Auspicious Day", scratchHint: "Gently scratch the sandalwood to reveal the date", eventsTitle: "Auspicious Ceremonies", closingLine: "Seeking your blessings" }}
      />
    </div>
  );
}
