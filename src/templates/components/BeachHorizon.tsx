"use client";

import type { InvitationData } from "@/lib/invitation-types";
import { InvitationBody, PhotoHero, useOpening, rootClip, COVER_HEIGHT, coupleNames, nameSize, type InviteTheme } from "../shared/InvitationBody";
import { parseDate, monthName } from "../invite-utils";

// Ocean foil with wave lines for the scratch card.
function paintOcean(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  ["#006994", "#40e0d0", "#00b4d8", "#40e0d0", "#006994"].forEach((c, i) => g.addColorStop(i / 4, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  for (let y = 10; y < h; y += 18) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const wy = y + Math.sin((x + y) * 0.15) * 4;
      if (x === 0) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "600 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SWIPE THE WAVES TO REVEAL", w / 2, h / 2);
}

const theme: InviteTheme = {
  section: "bg-gradient-to-b from-[#005f73] via-[#0a9396] to-[#005f73]",
  text: "text-[#f6f0de]",
  muted: "text-[#cfe9e2]",
  accent: "text-[#e9d8a6]",
  heading: "font-bh-display text-white",
  body: "font-bh-body",
  card: "rounded-3xl bg-white/10 backdrop-blur-md border border-white/25 shadow-[0_12px_40px_rgba(0,48,73,0.25)]",
  divider: "border-white/20",
  button: "inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-[#003049] text-xs font-bold uppercase tracking-wider hover:brightness-110 transition",
  ghostButton: "inline-block px-5 py-2.5 rounded-full border border-white/60 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition",
  countBox: "rounded-2xl bg-white/12 backdrop-blur-md border border-white/40",
  countNumber: "font-bh-display text-white",
  scratchSurface: "bg-gradient-to-br from-[#003049] to-[#005f73] border border-white/30",
  scratchPaint: paintOcean,
  gallery: "slider",
};

function Wave({ from, flip = false }: { from: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className={`block w-full h-10 ${flip ? "-scale-y-100" : ""}`} aria-hidden>
      <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill={from} />
    </svg>
  );
}

function Shell({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <path d="M32 8 C20 8 10 18 10 32 C10 46 20 56 32 56 C44 56 54 46 54 32 C54 18 44 8 32 8 Z" stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="rgba(255,255,255,0.1)" />
      <path d="M32 16 C24 16 18 23 18 32 C18 41 24 48 32 48 M32 20 C26 20 22 25 22 32" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="4" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

const BUBBLES = Array.from({ length: 16 }, (_, i) => ({ left: `${(i * 41) % 100}%`, size: 8 + ((i * 7) % 14), delay: `${(i % 5) * 0.35}s`, dur: `${3 + (i % 4)}s` }));

/**
 * BeachHorizon — Destination.
 * A sunset beach behind a sea-toned curtain that rises to reveal the couple, with bubbles,
 * wave dividers and a glassy teal-and-sand invitation body.
 */
export function BeachHorizon({ data }: { data: InvitationData }) {
  const { groom, bride } = coupleNames(data);
  const { opened, gone, open } = useOpening(1800);
  const photo = data.coupleImage || data.brideImage || data.groomImage;
  const date = parseDate(data.weddingDate);

  return (
    <div className={`relative w-full bg-[#005f73] text-white antialiased ${rootClip(gone)}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Nunito+Sans:wght@400;600;700&display=swap');
        .font-bh-display { font-family: 'Playfair Display', serif; }
        .font-bh-body { font-family: 'Nunito Sans', system-ui, sans-serif; }
        @keyframes bh-sun { 0%, 100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.08); } }
        @keyframes bh-bubble { 0% { transform: translateY(0) scale(1); opacity: .8; } 100% { transform: translateY(-680px) scale(1.3); opacity: 0; } }
        @keyframes bh-sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes bh-pulse { 0%, 100% { box-shadow: 0 8px 24px rgba(255,140,0,.45); } 50% { box-shadow: 0 12px 36px rgba(255,140,0,.8); } }
        .bh-sun { animation: bh-sun 3s ease-in-out infinite; }
        .bh-bubble { animation: bh-bubble ease-in infinite; }
        .bh-sway { transform-origin: bottom center; animation: bh-sway 4s ease-in-out infinite; }
        .bh-pulse { animation: bh-pulse 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .bh-sun, .bh-bubble, .bh-sway, .bh-pulse { animation: none !important; } }
      `}</style>

      {/* ===== Opening: sunset + rising curtain ===== */}
      {!gone && (
        <div className={`absolute inset-x-0 top-0 ${COVER_HEIGHT} z-40 overflow-hidden ${opened ? "pointer-events-none" : ""}`}>
          <div className={`absolute inset-0 bg-[linear-gradient(180deg,#87ceeb_0%,#ffd700_40%,#ff8c00_65%,#006994_100%)] transition-opacity duration-700 delay-1000 ${opened ? "opacity-0" : ""}`}>
            <div className="bh-sun absolute top-[16%] left-1/2 w-20 h-20 rounded-full bg-[radial-gradient(circle,#fff7aa,#ffd700)] shadow-[0_0_60px_#ffd70099,0_0_120px_#ff8c0066]" />
            <span className="bh-sway absolute bottom-[18%] -left-2 text-7xl opacity-80">🌴</span>
            <span className="bh-sway absolute bottom-[18%] -right-2 text-6xl opacity-80" style={{ animationDelay: "1s" }}>🌴</span>
          </div>

          <div
            className="absolute inset-0 transition-transform duration-[1800ms] ease-[cubic-bezier(0.77,0,0.18,1)] bg-[linear-gradient(180deg,#005f73_0%,#0a9396_30%,#94d2bd_60%,#e9d8a6_100%)]"
            style={{ transform: opened ? "translateY(-100%)" : "none" }}
          >
            {[10, 25, 40, 55, 70, 85].map((x) => (
              <div key={x} className="absolute top-0 bottom-0 w-[8%] bg-black/[0.07] rounded-r-full" style={{ left: `${x}%` }} aria-hidden />
            ))}
            <div className="absolute top-0 inset-x-0 h-6 bg-[linear-gradient(180deg,#8b4513,#cd853f,#8b4513)] shadow-[0_4px_12px_rgba(0,0,0,0.4)]" aria-hidden />
            <div className="absolute inset-0 top-8 flex flex-col items-center justify-center text-center px-8">
              <Shell className="w-14 h-14" />
              <p className="mt-3 text-[11px] uppercase tracking-[0.4em] text-white/85">A destination wedding</p>
              <p className={`font-bh-display ${nameSize(groom, ["text-3xl", "text-4xl", "text-5xl"])} font-bold mt-3 drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]`}>{groom}</p>
              <p className="font-bh-display italic text-xl text-white/85">&amp;</p>
              <p className={`font-bh-display ${nameSize(bride, ["text-3xl", "text-4xl", "text-5xl"])} font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]`}>{bride}</p>
              <p className="mt-2 text-sm text-white/80">are getting married</p>
              <button
                type="button"
                onClick={open}
                className="bh-pulse mt-7 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-[#003049] text-sm font-bold uppercase tracking-[0.2em]"
              >
                Raise the Curtain
              </button>
            </div>
          </div>
        </div>
      )}

      {opened && !gone && (
        <div className="absolute inset-x-0 top-0 h-[660px] z-50 pointer-events-none overflow-hidden" aria-hidden>
          {BUBBLES.map((b, i) => (
            <span
              key={i}
              className="bh-bubble absolute bottom-0 rounded-full border border-white/50 bg-[#40e0d0]/40"
              style={{ left: b.left, width: b.size, height: b.size, animationDelay: b.delay, animationDuration: b.dur }}
            />
          ))}
        </div>
      )}

      {/* ===== Hero ===== */}
      <PhotoHero
        photo={photo}
        alt={`${groom} and ${bride}`}
        overlay="bg-gradient-to-b from-[#005f73]/20 via-[#005f73]/65 to-[#005f73]"
        fallback="bg-[linear-gradient(180deg,#87ceeb_0%,#94d2bd_45%,#0a9396_75%,#005f73_100%)]"
      >
        <Shell className="w-11 h-11 mx-auto" />
        <p className="mt-3 text-[11px] uppercase tracking-[0.4em] text-white/75">Destination Wedding</p>
        <h1 className={`font-bh-display ${nameSize(groom)} font-bold mt-3 leading-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.3)]`}>{groom}</h1>
        <p className="font-bh-display italic text-2xl text-white/85 my-1">&amp;</p>
        <h1 className={`font-bh-display ${nameSize(bride)} font-bold leading-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.3)]`}>{bride}</h1>
        {date && (
          <p className="mt-5 text-sm tracking-[0.2em] text-[#94d2bd]">
            {date.getDate()} {monthName(date).toUpperCase()} {date.getFullYear()}
          </p>
        )}
      </PhotoHero>
      <div className="bg-[#005f73] -mt-px">
        <Wave from="#005f73" />
      </div>

      <InvitationBody
        data={data}
        theme={theme}
        labels={{ scratchTitle: "Our Beach Wedding", countdownTitle: "Days until we say I do", eventsTitle: "Celebrations", closingLine: "See you at the shore" }}
      />
    </div>
  );
}
