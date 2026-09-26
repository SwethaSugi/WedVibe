"use client";

import type { InvitationData } from "@/lib/invitation-types";
import { InvitationBody, PhotoHero, useOpening, rootClip, COVER_HEIGHT, coupleNames, nameSize, foilPainter, type InviteTheme } from "../shared/InvitationBody";
import { parseDate, monthName } from "../invite-utils";

const theme: InviteTheme = {
  section: "bg-gradient-to-b from-[#111726] via-[#0e1320] to-[#090d16]",
  text: "text-slate-200",
  muted: "text-slate-400",
  accent: "text-[#e2b89b]",
  heading: "font-lx-display text-white",
  body: "font-lx-body",
  card: "rounded-3xl bg-white/[0.04] border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.4)]",
  divider: "border-white/10",
  button: "inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#e2b89b] to-[#c08552] text-black text-xs font-semibold uppercase tracking-wider hover:brightness-110 transition",
  ghostButton: "inline-block px-5 py-2.5 rounded-full border border-white/30 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition",
  countBox: "rounded-2xl bg-black/50 border border-white/10",
  countNumber: "font-lx-display text-[#e2b89b]",
  scratchSurface: "bg-black/70 border border-[#e2b89b]/50",
  scratchPaint: foilPainter(["#e2b89b", "#f472b6", "#60a5fa", "#34d399", "#e2b89b"], "✦  SCRATCH THE PRISM  ✦", "rgba(0,0,0,0.8)"),
  gallery: "grid",
};

/**
 * LuxeGiftBox — Modern.
 * A matte black gift box tied with a holographic ribbon; its lid lifts away to reveal the couple,
 * followed by the shared invitation body in midnight navy, rose gold and prism accents.
 */
export function LuxeGiftBox({ data }: { data: InvitationData }) {
  const { groom, bride } = coupleNames(data);
  const { opened, gone, open } = useOpening(1500);
  const photo = data.coupleImage || data.brideImage || data.groomImage;
  const date = parseDate(data.weddingDate);

  return (
    <div className={`relative w-full bg-[#090d16] text-white antialiased ${rootClip(gone)}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;600&display=swap');
        .font-lx-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-lx-body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        @keyframes lx-holo { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes lx-glow { 0%, 100% { box-shadow: 0 0 20px rgba(226,184,155,0.25); } 50% { box-shadow: 0 0 44px rgba(244,114,182,0.5); } }
        .lx-holo { background: linear-gradient(135deg, #e2b89b, #f472b6, #60a5fa, #34d399, #e2b89b); background-size: 300% 300%; animation: lx-holo 6s ease infinite; }
        .lx-glow { animation: lx-glow 4s ease-in-out infinite; }
        .lx-lid { transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.1s ease; }
        @media (prefers-reduced-motion: reduce) { .lx-holo, .lx-glow { animation: none !important; } }
      `}</style>

      {/* ===== Opening: gift box ===== */}
      {!gone && (
        <div
          className={`absolute inset-x-0 top-0 ${COVER_HEIGHT} z-40 overflow-hidden flex flex-col items-center justify-center text-center px-6 bg-[radial-gradient(ellipse_at_center,_#1a2234_0%,_#090d16_70%)] transition-opacity duration-500 delay-1000 ${opened ? "opacity-0 pointer-events-none" : ""}`}
        >
          <div className="lx-holo w-20 h-1 rounded-full mb-5" />
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#e2b89b] font-lx-body font-semibold">An invitation for you</p>
          <p className={`font-lx-display ${nameSize(`${groom} ${bride}`, ["text-2xl", "text-3xl", "text-4xl"])} font-light mt-3`}>
            {groom} &amp; {bride}
          </p>

          <button type="button" onClick={open} aria-label="Open the gift box" className="relative mt-10 mb-8 w-56 h-48">
            {/* Box base */}
            <div className="lx-glow absolute bottom-0 inset-x-2 h-32 rounded-b-2xl bg-gradient-to-b from-[#1a2234] to-[#121826] border border-white/20">
              <div className="lx-holo absolute inset-y-0 left-1/2 -translate-x-1/2 w-5" />
            </div>
            {/* Lid with bow */}
            <div
              className="lx-lid absolute top-6 inset-x-0 h-14 rounded-xl bg-gradient-to-b from-[#232c42] to-[#1a2234] border border-white/25 shadow-xl"
              style={{ transform: opened ? "translateY(-220px) rotate(-14deg)" : "none", opacity: opened ? 0 : 1 }}
            >
              <div className="lx-holo absolute inset-y-0 left-1/2 -translate-x-1/2 w-5" />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex">
                <span className="lx-holo w-9 h-8 rounded-[60%_40%_40%_60%] -rotate-12 border border-white/40" />
                <span className="lx-holo w-9 h-8 rounded-[40%_60%_60%_40%] rotate-12 border border-white/40 -ml-2" />
              </div>
            </div>
          </button>

          <span className="px-6 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-lx-body font-semibold text-[#e2b89b] tracking-[0.2em] uppercase">
            Open the Box
          </span>
          <p className="mt-3 text-[11px] font-lx-body text-slate-400">Tap the box to lift the lid</p>
        </div>
      )}

      {/* ===== Hero ===== */}
      <PhotoHero
        photo={photo}
        alt={`${groom} and ${bride}`}
        overlay="bg-gradient-to-t from-[#111726] via-[#111726]/50 to-transparent"
        fallback="bg-[radial-gradient(ellipse_at_top,_#2a2f45_0%,_#141a2a_55%,_#111726_100%)]"
        imgClassName="brightness-[0.75] contrast-[1.1]"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#e2b89b] font-lx-body font-semibold">Forever begins here</p>
        <h1 className={`font-lx-display ${nameSize(groom)} font-light mt-2 leading-tight`}>{groom}</h1>
        <p className="font-lx-display italic text-2xl text-[#e2b89b] my-1">and</p>
        <h1 className={`font-lx-display ${nameSize(bride)} font-light leading-tight`}>{bride}</h1>
        {date && (
          <p className="mt-5 text-xs tracking-[0.3em] text-slate-300 font-lx-body">
            {date.getDate()} {monthName(date).toUpperCase()} {date.getFullYear()}
          </p>
        )}
      </PhotoHero>

      <InvitationBody
        data={data}
        theme={theme}
        labels={{ scratchTitle: "The Date & Time", scratchHint: "Scratch the holographic prism to reveal the date", closingLine: "With warm regards" }}
      />
    </div>
  );
}
