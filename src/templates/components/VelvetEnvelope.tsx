"use client";

import type { InvitationData } from "@/lib/invitation-types";
import { InvitationBody, PhotoHero, useOpening, rootClip, COVER_HEIGHT, coupleNames, nameSize, foilPainter, type InviteTheme } from "../shared/InvitationBody";
import { parseDate, monthName } from "../invite-utils";

const theme: InviteTheme = {
  section: "bg-gradient-to-b from-[#2c060b] via-[#240509] to-[#1e0407]",
  text: "text-amber-50",
  muted: "text-amber-200/70",
  accent: "text-amber-300",
  heading: "font-ve-display ve-gold",
  body: "font-ve-body",
  card: "rounded-2xl bg-[#430911]/60 border border-[#d4af37]/35 shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  divider: "border-[#d4af37]/30",
  button: "inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#996515] text-black text-xs font-bold uppercase tracking-wider hover:brightness-110 transition",
  ghostButton: "inline-block px-5 py-2.5 rounded-full border border-[#d4af37]/60 text-amber-200 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition",
  countBox: "rounded-xl bg-[#1a0306] border border-[#d4af37]/40",
  countNumber: "font-ve-display text-amber-300",
  scratchSurface: "bg-black/60 border-2 border-[#d4af37]/60",
  scratchPaint: foilPainter(["#996515", "#d4af37", "#fde68a", "#d4af37", "#996515"], "✦  SCRATCH THE GOLD FOIL  ✦", "rgba(40,10,5,0.85)"),
  gallery: "grid",
};

/**
 * VelvetEnvelope — Royal.
 * A maroon velvet envelope sealed with gold wax: the seal cracks away, the flap folds open and
 * the invitation card slides out, followed by a royal maroon-and-gold invitation body.
 */
export function VelvetEnvelope({ data }: { data: InvitationData }) {
  const { groom, bride } = coupleNames(data);
  const { opened, gone, open } = useOpening(1800);
  const photo = data.coupleImage || data.brideImage || data.groomImage;
  const date = parseDate(data.weddingDate);
  const initials = `${groom.charAt(0)}&${bride.charAt(0)}`;

  return (
    <div className={`relative w-full bg-[#1e0407] text-white antialiased ${rootClip(gone)}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@600;700&family=Marcellus&display=swap');
        .font-ve-display { font-family: 'Cinzel Decorative', serif; }
        .font-ve-cinzel { font-family: 'Cinzel', serif; }
        .font-ve-body { font-family: 'Marcellus', serif; }
        .ve-gold { background: linear-gradient(135deg, #fff6d3 0%, #f5d77f 45%, #d4af37 80%, #996515 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        @keyframes ve-seal { 0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(230,193,88,0.5)); } 50% { transform: scale(1.06); filter: drop-shadow(0 0 22px rgba(245,158,11,0.9)); } }
        .ve-seal { animation: ve-seal 2.8s ease-in-out infinite; }
        .ve-flap { transform-origin: top center; transition: transform .9s cubic-bezier(0.65, 0, 0.35, 1) .35s; backface-visibility: hidden; }
        .ve-card { transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1) .9s; }
        .ve-velvet { background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 4px 4px; }
        @media (prefers-reduced-motion: reduce) { .ve-seal { animation: none !important; } }
      `}</style>

      {/* ===== Opening: sealed velvet envelope ===== */}
      {!gone && (
        <div
          className={`absolute inset-x-0 top-0 ${COVER_HEIGHT} z-40 overflow-hidden flex flex-col items-center justify-center px-5 bg-[radial-gradient(ellipse_at_center,_#4e0812_0%,_#1e0407_70%)] transition-opacity duration-500 delay-[1400ms] ${opened ? "opacity-0 pointer-events-none" : ""}`}
          style={{ perspective: "1200px" }}
        >
          <p className="text-xs uppercase tracking-[0.3em] font-ve-cinzel text-[#fde68a] mb-6">A royal invitation for you</p>

          <div className="relative w-full max-w-sm h-64">
            {/* Card inside the envelope, slides up when opened */}
            <div
              className="ve-card absolute inset-x-5 top-4 bottom-4 rounded-xl bg-[#fff8ec] border border-[#d4af37] flex flex-col items-center justify-center text-center px-4"
              style={{ transform: opened ? "translateY(-150px)" : "none" }}
              aria-hidden
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#996515] font-ve-cinzel">The wedding of</p>
              <p className="font-ve-display text-xl text-[#5e0f1c] mt-1">{groom} &amp; {bride}</p>
            </div>
            {/* Envelope body */}
            <div className="ve-velvet absolute inset-0 rounded-2xl bg-[#38060d] border-2 border-[#d4af37] shadow-[0_20px_70px_rgba(0,0,0,0.9)]" />
            <div
              className="absolute inset-x-0 bottom-0 h-full rounded-2xl pointer-events-none"
              style={{ background: "linear-gradient(to top right, #4e0812 50%, transparent 50%) left / 50% 100% no-repeat, linear-gradient(to top left, #4e0812 50%, transparent 50%) right / 50% 100% no-repeat" }}
              aria-hidden
            />
            {/* Flap */}
            <div
              className="ve-flap absolute inset-x-0 top-0 h-1/2 pointer-events-none"
              style={{ transform: opened ? "rotateX(180deg)" : "none" }}
              aria-hidden
            >
              <div className="w-full h-full" style={{ background: "#4e0812", clipPath: "polygon(0 0, 100% 0, 50% 100%)", filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.5))" }} />
            </div>
            {/* Wax seal */}
            <button
              type="button"
              onClick={open}
              aria-label="Break the wax seal to open the invitation"
              className={`ve-seal absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-[#b91c1c] via-[#991b1b] to-[#450a0a] border-2 border-[#fde68a] shadow-2xl flex items-center justify-center transition-all duration-500 ${opened ? "scale-150 opacity-0" : ""}`}
            >
              <span className="font-ve-display text-xl text-[#fde68a] font-black">{initials}</span>
            </button>
          </div>

          <p className={`font-ve-display ${nameSize(`${groom} ${bride}`, ["text-xl", "text-2xl", "text-3xl"])} ve-gold font-bold mt-8 text-center`}>
            {groom} &amp; {bride}
          </p>
          <span className="mt-5 px-5 py-2 rounded-full bg-[#1a0306]/90 border border-[#d4af37]/60 text-[11px] font-ve-cinzel font-bold text-[#fde68a] tracking-[0.2em] uppercase">
            Break the Seal
          </span>
          <p className="mt-3 text-[11px] font-ve-body text-amber-200/60">Tap the wax seal to open</p>
        </div>
      )}

      {/* ===== Hero ===== */}
      <PhotoHero
        photo={photo}
        alt={`${groom} and ${bride}`}
        overlay="bg-gradient-to-t from-[#2c060b] via-[#2c060b]/50 to-transparent"
        fallback="bg-[radial-gradient(ellipse_at_top,_#5e0f1c_0%,_#38060d_55%,_#2c060b_100%)]"
        imgClassName="brightness-[0.75] contrast-[1.1]"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] font-ve-cinzel text-amber-300 font-bold">An auspicious wedding</p>
        <h1 className={`font-ve-display ${nameSize(groom, ["text-2xl sm:text-3xl", "text-3xl sm:text-4xl", "text-4xl sm:text-5xl"])} ve-gold font-bold mt-2 leading-tight`}>{groom}</h1>
        <p className="font-ve-cinzel italic text-xl text-amber-200 my-1">&amp;</p>
        <h1 className={`font-ve-display ${nameSize(bride, ["text-2xl sm:text-3xl", "text-3xl sm:text-4xl", "text-4xl sm:text-5xl"])} ve-gold font-bold leading-tight`}>{bride}</h1>
        {date && (
          <p className="mt-5 text-xs tracking-[0.3em] text-amber-200 font-ve-cinzel">
            {date.getDate()} {monthName(date).toUpperCase()} {date.getFullYear()}
          </p>
        )}
      </PhotoHero>

      <InvitationBody
        data={data}
        theme={theme}
        labels={{ scratchTitle: "The Auspicious Date", scratchHint: "Scratch the golden foil to unlock the date", eventsTitle: "Celebration Schedule", closingLine: "Cordially invited" }}
      />
    </div>
  );
}
