"use client";

import type { InvitationData } from "@/lib/invitation-types";
import { InvitationBody, PhotoHero, useOpening, rootClip, COVER_HEIGHT, coupleNames, nameSize, foilPainter, type InviteTheme } from "../shared/InvitationBody";
import { parseDate, monthName } from "../invite-utils";

const theme: InviteTheme = {
  section: "bg-gradient-to-b from-[#111726] via-[#0f1422] to-[#0c0f17]",
  text: "text-slate-200",
  muted: "text-slate-400",
  accent: "text-[#e2b89b]",
  heading: "font-bv-display text-white",
  body: "font-bv-body",
  card: "rounded-3xl bg-white/[0.04] border border-[#e2b89b]/25 shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
  divider: "border-white/10",
  button: "inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#e2b89b] to-[#c08552] text-black text-xs font-semibold uppercase tracking-wider hover:brightness-110 transition",
  ghostButton: "inline-block px-5 py-2.5 rounded-full border border-[#e2b89b]/60 text-[#e2b89b] text-xs font-semibold uppercase tracking-wider hover:bg-white/5 transition",
  countBox: "rounded-2xl bg-black/40 border border-white/10",
  countNumber: "font-bv-display text-[#e2b89b]",
  scratchSurface: "bg-black/70 border border-white/20",
  scratchPaint: foilPainter(["#e2b89b", "#fb7185", "#be185d"], "✦  SCRATCH TO UNVEIL THE DATE  ✦", "rgba(255,255,255,0.85)"),
  gallery: "grid",
};

/**
 * BookOfVows — Modern / Editorial.
 * A hardbound storybook with a rose-gold monogram; its cover swings open like a real book to
 * reveal an editorial couple spread and the shared invitation body.
 */
export function BookOfVows({ data }: { data: InvitationData }) {
  const { groom, bride } = coupleNames(data);
  const { opened, gone, open } = useOpening(1500);
  const photo = data.coupleImage || data.brideImage || data.groomImage;
  const date = parseDate(data.weddingDate);

  return (
    <div className={`relative w-full bg-[#0c0f17] text-white antialiased ${rootClip(gone)}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;600&display=swap');
        .font-bv-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-bv-body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
        @keyframes bv-pulse { 0%, 100% { filter: drop-shadow(0 0 15px rgba(226,184,155,0.35)); } 50% { filter: drop-shadow(0 0 30px rgba(226,184,155,0.7)); } }
        .bv-pulse { animation: bv-pulse 3.5s ease-in-out infinite; }
        .bv-cover { transition: transform 1.4s cubic-bezier(0.645, 0.045, 0.355, 1); transform-origin: left center; backface-visibility: hidden; }
        @media (prefers-reduced-motion: reduce) { .bv-pulse { animation: none !important; } .bv-cover { transition: opacity .4s; } }
      `}</style>

      {/* ===== Opening: storybook cover ===== */}
      {!gone && (
        <div
          className={`absolute inset-x-0 top-0 ${COVER_HEIGHT} z-40 flex items-center justify-center p-6 bg-[#07090f] transition-opacity duration-500 delay-1000 ${opened ? "opacity-0 pointer-events-none" : ""}`}
          style={{ perspective: "1600px" }}
        >
          {/* Pages under the cover */}
          <div className="absolute w-[82%] max-w-sm h-[520px] rounded-r-3xl rounded-l-md bg-[#f5efe6] shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex items-center justify-center" aria-hidden>
            <p className="font-bv-display italic text-2xl text-[#7a5a45]">Our story begins…</p>
          </div>
          <div
            className="bv-cover bv-pulse relative w-[82%] max-w-sm h-[520px] rounded-r-3xl rounded-l-md bg-gradient-to-r from-[#171e2d] to-[#101522] border-r-4 border-y-2 border-[#e2b89b]/80 p-8 flex flex-col items-center justify-between text-center"
            style={{ transform: opened ? "rotateY(-165deg)" : "none" }}
          >
            <div className="absolute left-0 inset-y-0 w-6 bg-gradient-to-r from-black/80 to-transparent rounded-l-md border-r border-[#e2b89b]/30" aria-hidden />
            <div className="pt-4">
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#e2b89b] font-semibold">Chapter one · The wedding story</p>
              <p className={`font-bv-display ${nameSize(`${groom} ${bride}`, ["text-2xl", "text-3xl", "text-4xl"])} font-light mt-3 leading-tight`}>
                {groom} &amp; {bride}
              </p>
            </div>
            <div className="w-24 h-24 rounded-full border-2 border-[#e2b89b] p-1 bg-black/40">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#e2b89b]/20 to-transparent flex items-center justify-center font-bv-display italic text-2xl text-[#e2b89b]">
                {groom.charAt(0)}&amp;{bride.charAt(0)}
              </div>
            </div>
            <div className="pb-2">
              <button
                type="button"
                onClick={open}
                className="px-7 py-3 rounded-full bg-gradient-to-r from-[#e2b89b] via-[#d4a373] to-[#c08552] text-black text-xs font-semibold uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition"
              >
                Open the Book
              </button>
              <p className="mt-2 text-[11px] text-slate-400">Turn the cover to read our story</p>
            </div>
          </div>
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
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#e2b89b] font-semibold">Our beautiful beginning</p>
        <h1 className={`font-bv-display ${nameSize(groom)} font-light mt-2 leading-tight`}>{groom}</h1>
        <p className="font-bv-display italic text-2xl text-[#e2b89b] my-1">and</p>
        <h1 className={`font-bv-display ${nameSize(bride)} font-light leading-tight`}>{bride}</h1>
        {date && (
          <p className="mt-5 text-xs tracking-[0.3em] text-slate-300">
            {date.getDate()} {monthName(date).toUpperCase()} {date.getFullYear()}
          </p>
        )}
      </PhotoHero>

      <InvitationBody
        data={data}
        theme={theme}
        labels={{ scratchTitle: "Our Special Date", scratchHint: "Gently drag across the rose-gold foil to reveal", closingLine: "With sincere gratitude" }}
      />
    </div>
  );
}
