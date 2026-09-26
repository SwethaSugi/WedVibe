"use client";

import type { InvitationData } from "@/lib/invitation-types";
import { InvitationBody, PhotoHero, useOpening, rootClip, COVER_HEIGHT, coupleNames, nameSize, foilPainter, type InviteTheme } from "../shared/InvitationBody";
import { parseDate, monthName } from "../invite-utils";

const theme: InviteTheme = {
  section: "bg-gradient-to-b from-[#0d0520] via-[#150a30] to-[#0d0520]",
  text: "text-[#efe3ff]",
  muted: "text-[#b9a6d8]",
  accent: "text-[#f0b429]",
  heading: "font-sg-display text-[#f0b429]",
  body: "font-sg-body",
  card: "rounded-2xl bg-gradient-to-br from-[#1a0a35] to-[#2d1b5e] border border-[#f0b429]/30 shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  divider: "border-[#f0b429]/25",
  button: "inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#f0b429] to-[#d4821a] text-[#1a0a35] text-xs font-bold uppercase tracking-wider hover:brightness-110 transition",
  ghostButton: "inline-block px-5 py-2.5 rounded-full border border-[#f0b429]/60 text-[#f0b429] text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition",
  countBox: "rounded-xl bg-gradient-to-br from-[#1a0a35] to-[#2d1b5e] border-2 border-[#f0b429] shadow-[0_0_14px_rgba(240,180,41,0.35)]",
  countNumber: "font-sg-display text-[#f0b429]",
  scratchSurface: "bg-gradient-to-br from-[#1a0a35] to-[#2d1b5e] border-2 border-[#f0b429]",
  scratchPaint: foilPainter(["#f0b429", "#ff8c00", "#f0b429", "#d4821a"], "✦  SCRATCH TO REVEAL  ✦", "rgba(30,10,60,0.85)"),
  gallery: "slider",
};

// The Khanda emblem (drawn with simple strokes).
function Khanda({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" aria-hidden>
      <path d="M50 5 L50 95" />
      <path d="M20 50 Q35 20 50 50 Q65 20 80 50" />
      <path d="M20 50 Q35 80 50 50 Q65 80 80 50" />
      <circle cx="50" cy="50" r="10" />
      <path d="M15 35 L85 35 M15 65 L85 65" strokeWidth="3" />
    </svg>
  );
}

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 6) * 0.3}s`,
  dur: `${2.6 + (i % 5) * 0.5}s`,
  color: i % 3 === 0 ? "#f0b429" : i % 3 === 1 ? "#ff7f00" : "#ffffff",
}));

const STARS = Array.from({ length: 28 }, (_, i) => ({ left: `${(i * 53) % 100}%`, top: `${(i * 29) % 100}%`, delay: `${(i % 7) * 0.4}s` }));

/**
 * SacredGates — North Indian (Anand Karaj).
 * Violet night and saffron gold: carved gates swing open in 3D with a shower of petals, onto a
 * couple photo hero and the shared invitation body.
 */
export function SacredGates({ data }: { data: InvitationData }) {
  const { groom, bride } = coupleNames(data);
  const { opened, gone, open } = useOpening(1700);
  const photo = data.coupleImage || data.brideImage || data.groomImage;
  const date = parseDate(data.weddingDate);

  return (
    <div className={`relative w-full bg-[#0d0520] text-white antialiased ${rootClip(gone)}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        .font-sg-display { font-family: 'Cinzel', serif; }
        .font-sg-body { font-family: 'Cormorant Garamond', Georgia, serif; }
        @keyframes sg-twinkle { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 1; transform: scale(1.6); } }
        @keyframes sg-petal { 0% { transform: translateY(-20px) rotate(0deg); opacity: 0.9; } 100% { transform: translateY(680px) rotate(360deg); opacity: 0; } }
        @keyframes sg-glow { 0%, 100% { box-shadow: 0 0 24px rgba(240,180,41,0.4); } 50% { box-shadow: 0 0 44px rgba(240,180,41,0.85); } }
        .sg-star { animation: sg-twinkle 2.4s ease-in-out infinite; }
        .sg-petal { animation: sg-petal linear infinite; }
        .sg-glow { animation: sg-glow 2s ease-in-out infinite; }
        .sg-gate { transition: transform 1.6s cubic-bezier(0.77, 0, 0.18, 1); backface-visibility: hidden; }
        @media (prefers-reduced-motion: reduce) { .sg-star, .sg-petal, .sg-glow { animation: none !important; } .sg-gate { transition: opacity .4s; } }
      `}</style>

      {/* ===== Opening: carved gates ===== */}
      {!gone && (
        <div className={`absolute inset-x-0 top-0 ${COVER_HEIGHT} z-40 overflow-hidden ${opened ? "pointer-events-none" : ""}`} style={{ perspective: "1300px" }}>
          <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,_#2d1b5e,_#0d0520_70%)] transition-opacity duration-700 ${opened ? "opacity-0" : ""}`} />
          {STARS.map((s, i) => (
            <span key={i} className="sg-star absolute w-0.5 h-0.5 rounded-full bg-[#f0b429]" style={{ left: s.left, top: s.top, animationDelay: s.delay }} />
          ))}
          {(["left", "right"] as const).map((side) => (
            <div
              key={side}
              className={`sg-gate absolute top-0 bottom-0 w-1/2 ${side === "left" ? "left-0 origin-left border-r-[3px]" : "right-0 origin-right border-l-[3px]"} border-[#f0b429] bg-[linear-gradient(180deg,#2a0d5e_0%,#1a0a35_40%,#2a0d5e_70%,#1a0a35_100%)]`}
              style={{ transform: opened ? `rotateY(${side === "left" ? -110 : 110}deg)` : "none" }}
              aria-hidden
            >
              <div className="absolute inset-4 border border-[#f0b429]/40 rounded" />
              <div className="absolute inset-7 border border-[#f0b429]/20 rounded-sm" />
              <svg viewBox="0 0 60 80" className="absolute top-[14%] left-1/2 -translate-x-1/2 w-14 h-20" fill="rgba(240,180,41,0.08)" stroke="#f0b429" strokeWidth="2">
                <path d="M5 80 L5 40 Q5 5 30 5 Q55 5 55 40 L55 80" />
              </svg>
              <div className={`absolute top-1/2 -translate-y-1/2 ${side === "left" ? "right-3" : "left-3"} w-3.5 h-10 rounded-full bg-gradient-to-b from-[#f0b429] via-[#d4821a] to-[#f0b429] shadow-[0_0_10px_rgba(240,180,41,0.5)]`} />
            </div>
          ))}

          <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-opacity duration-500 ${opened ? "opacity-0" : ""}`}>
            <Khanda className="w-16 h-16 text-[#f0b429]" />
            <p className="mt-4 font-sg-body italic text-[#c8a96e]">With the blessings of Waheguru</p>
            <p className={`font-sg-display ${nameSize(groom, ["text-2xl", "text-3xl", "text-4xl"])} text-[#f0b429] mt-3 leading-tight`}>{groom}</p>
            <p className="font-sg-body text-xl text-[#c8a96e]">&amp;</p>
            <p className={`font-sg-display ${nameSize(bride, ["text-2xl", "text-3xl", "text-4xl"])} text-[#f0b429] leading-tight`}>{bride}</p>
            <p className="mt-3 text-sm text-[#c8a96e] tracking-wide">invite you to celebrate their</p>
            <p className="font-sg-body italic text-2xl text-white">Anand Karaj</p>
            <button
              type="button"
              onClick={open}
              className="sg-glow mt-7 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#f0b429] to-[#d4821a] text-[#1a0a35] text-sm font-bold uppercase tracking-[0.2em]"
            >
              Open the Gates
            </button>
          </div>
        </div>
      )}

      {/* Petal shower as the gates open */}
      {opened && !gone && (
        <div className="absolute inset-x-0 top-0 h-[680px] z-50 pointer-events-none overflow-hidden" aria-hidden>
          {PETALS.map((p, i) => (
            <span key={i} className="sg-petal absolute -top-4 w-2.5 h-2.5" style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur, background: p.color, borderRadius: "50% 0 50% 0" }} />
          ))}
        </div>
      )}

      {/* ===== Hero ===== */}
      <PhotoHero
        photo={photo}
        alt={`${groom} and ${bride}`}
        overlay="bg-gradient-to-b from-[#0d0520]/30 via-[#0d0520]/70 to-[#0d0520]"
        fallback="bg-[radial-gradient(ellipse_at_top,_#3b2170_0%,_#150a30_55%,_#0d0520_100%)]"
        imgClassName="object-top"
      >
        <Khanda className="w-10 h-10 mx-auto text-[#f0b429] opacity-80" />
        <p className="mt-3 text-[11px] uppercase tracking-[0.4em] text-[#c8a96e]">Anand Karaj</p>
        <h1 className={`font-sg-display ${nameSize(groom)} text-[#f0b429] mt-3 leading-tight drop-shadow-[0_0_20px_rgba(240,180,41,0.45)]`}>{groom}</h1>
        <p className="font-sg-body italic text-2xl text-white my-1">weds</p>
        <h1 className={`font-sg-display ${nameSize(bride)} text-[#f0b429] leading-tight drop-shadow-[0_0_20px_rgba(240,180,41,0.45)]`}>{bride}</h1>
        {date && (
          <p className="mt-5 text-sm tracking-[0.2em] text-[#c8a96e]">
            {date.getDate()} {monthName(date).toUpperCase()} {date.getFullYear()}
          </p>
        )}
      </PhotoHero>

      <InvitationBody
        data={data}
        theme={theme}
        labels={{ scratchTitle: "The Sacred Day", countdownTitle: "Countdown to the sacred day", eventsTitle: "Celebrations", closingLine: "With the blessings of Waheguru" }}
      />
    </div>
  );
}
