"use client";

import { useEffect, useState } from "react";
import { InvitationData, InvitationEvent } from "@/lib/invitation-types";
import { Reveal } from "../Reveal";
import { ScratchCover, sprinkle } from "../ScratchCover";
import { useLiveCountdown } from "../useLiveCountdown";
import {
  parseDate,
  weddingMoment,
  ordinal,
  pad,
  weekdayName,
  monthName,
  googleCalendarUrl as calendarUrl,
  mapsSearchUrl as mapsSearch,
} from "../invite-utils";

// "Wednesday • 11th November 2026"
const longDate = (d: Date) => `${weekdayName(d)} • ${ordinal(d.getDate())} ${monthName(d)} ${d.getFullYear()}`;

const NUMBER_WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

// Long names step down a size so words don't split on phones.
const nameSize = (name: string) =>
  name.length > 16 ? "text-3xl sm:text-4xl" : name.length > 11 ? "text-4xl sm:text-5xl" : "text-5xl sm:text-6xl";

// ---------- scratch-to-reveal date card ----------

function paintGoldFoil(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#a8741f");
  g.addColorStop(0.45, "#f3d68a");
  g.addColorStop(0.7, "#d9ad52");
  g.addColorStop(1, "#9c6a1b");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  sprinkle(ctx, w, h, 70);
  ctx.fillStyle = "rgba(74,42,10,0.85)";
  ctx.font = "600 13px Montserrat, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✦   SCRATCH HERE   ✦", w / 2, h / 2);
}

function ScratchCard({ day, date }: { day: string; date: string }) {
  return (
    <ScratchCover
      paint={paintGoldFoil}
      ariaLabel={`Scratch to reveal ${day} ${date}`}
      className="w-full max-w-[320px] h-[160px] mx-auto rounded-2xl border-2 border-[#d9b36a] bg-gradient-to-br from-[#fffaf0] to-[#f6e7c8] shadow-[0_14px_40px_rgba(90,50,10,0.25)]"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-montserrat text-xs tracking-[0.35em] text-[#8a5a1c] font-semibold uppercase">{day}</div>
        <div className="font-bodoni text-4xl sm:text-5xl text-[#5a2e0e] mt-2">{date}</div>
      </div>
    </ScratchCover>
  );
}

// ---------- template ----------

/**
 * GoldenDoors — South Indian / Traditional.
 * Carved doors swing open to reveal a full-screen couple photo, a scratch-to-reveal date
 * card, an arched-photo event timeline with map and calendar buttons, a live countdown
 * and a personal note to guests.
 */
export function GoldenDoors({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venueName = data.venueName?.trim() || "";
  const venueAddress = data.venueAddress?.trim() || "";

  const [opened, setOpened] = useState(false);
  const [doorsGone, setDoorsGone] = useState(false);
  useEffect(() => {
    if (!opened) return;
    const t = setTimeout(() => setDoorsGone(true), 1700);
    return () => clearTimeout(t);
  }, [opened]);

  const weddingDate = parseDate(data.weddingDate);
  const target = weddingMoment(data.weddingDate, data.weddingTime);
  const left = useLiveCountdown(target);

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean) ?? [];
  const photos = [data.coupleImage, data.brideImage, data.groomImage, ...gallery].filter(Boolean) as string[];

  const events: InvitationEvent[] = data.events?.length ? data.events : [{ id: "main", eventName: "Wedding" }];
  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());

  const sectionBg = (img: string | undefined, overlay: string) =>
    img ? { backgroundImage: `${overlay}, url("${img}")` } : undefined;

  return (
    <div
      className={`relative w-full bg-[#20130c] text-[#fff8e9] antialiased font-montserrat ${
        doorsGone ? "" : "max-h-[680px] overflow-hidden"
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Allura&family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Montserrat:wght@400;500;600&family=Playfair+Display:wght@500;600&display=swap');
        .font-allura { font-family: 'Allura', cursive; }
        .font-bodoni { font-family: 'Bodoni Moda', serif; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-montserrat { font-family: 'Montserrat', system-ui, sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }

        .gd-wood {
          background:
            repeating-linear-gradient(90deg, rgba(0,0,0,0.07) 0 2px, transparent 2px 11px),
            linear-gradient(165deg, #7a4420 0%, #54290f 50%, #331809 100%);
        }
        .gd-door { transition: transform 1.6s cubic-bezier(0.77, 0, 0.18, 1); backface-visibility: hidden; }
        .gd-bg { background-size: cover; background-position: center; }

        @keyframes gd-glow { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
        @keyframes gd-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .gd-glow { animation: gd-glow 2.6s ease-in-out infinite; }
        .gd-float { animation: gd-float 3.2s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .gd-door { transition: opacity 0.4s ease; }
          .gd-glow, .gd-float { animation: none !important; }
        }
      `}</style>

      {/* ===== Opening doors ===== */}
      {!doorsGone && (
        <div className={`absolute inset-x-0 top-0 h-[680px] z-40 ${opened ? "pointer-events-none" : ""}`} style={{ perspective: "1400px" }}>
          {(["left", "right"] as const).map((side) => (
            <div
              key={side}
              className={`gd-door gd-wood absolute top-0 bottom-0 w-1/2 ${side === "left" ? "left-0 origin-left border-r" : "right-0 origin-right border-l"} border-[#2a1407]`}
              style={{ transform: opened ? `rotateY(${side === "left" ? -100 : 100}deg)` : "none" }}
              aria-hidden
            >
              <div
                className={`absolute inset-x-4 top-6 bottom-6 sm:inset-x-6 border-2 border-[#d9b36a]/55 ${
                  side === "left" ? "rounded-tl-[160px] border-r-0" : "rounded-tr-[160px] border-l-0"
                }`}
              >
                <div
                  className={`absolute inset-3 border border-[#d9b36a]/30 ${side === "left" ? "rounded-tl-[140px] border-r-0" : "rounded-tr-[140px] border-l-0"}`}
                />
              </div>
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-14 rounded-full bg-gradient-to-b from-[#f7dd9a] via-[#c99534] to-[#8a5e17] shadow-[0_0_12px_rgba(247,221,154,0.45)] ${
                  side === "left" ? "right-3" : "left-3"
                }`}
              />
            </div>
          ))}

          <div
            className={`absolute inset-0 bg-black/35 flex flex-col items-center justify-center text-center px-6 transition-opacity duration-700 ${
              opened ? "opacity-0" : "opacity-100"
            }`}
          >
            <p className="font-cormorant italic text-xl sm:text-2xl text-white/95">With all our hearts</p>
            <h1 className="font-bodoni text-5xl sm:text-6xl text-[#f5dfaa] mt-3 leading-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
              You are invited
            </h1>
            <p className="font-cormorant text-2xl sm:text-3xl text-[#f5dfaa] mt-1">to celebrate with us</p>
            <button
              type="button"
              onClick={() => setOpened(true)}
              className="mt-8 px-7 py-3 rounded-full bg-gradient-to-r from-[#f7dd9a] via-[#e2b75a] to-[#c99534] text-[#3a200e] text-xs font-semibold tracking-[0.3em] uppercase shadow-[0_8px_24px_rgba(0,0,0,0.45)] hover:brightness-110 active:scale-95 transition"
            >
              Open Invitation
            </button>
            <p className="gd-glow mt-4 text-[10px] tracking-[0.25em] uppercase text-white/85">Tap to open the doors</p>
          </div>
        </div>
      )}

      {/* ===== Hero ===== */}
      <section className="relative h-[680px] flex flex-col justify-end overflow-hidden">
        {heroPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroPhoto} alt={`${groom} and ${bride}`} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#7a4420_0%,_#3a1d0c_55%,_#20130c_100%)] flex items-center justify-center">
            <span className="font-allura text-[9rem] leading-none text-[#f5dfaa]/25">
              {groom.charAt(0)}
              {bride.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#20130c] via-[#20130c]/35 to-transparent" />
        <div className="relative px-6 pb-14 text-center">
          <p className="font-cormorant italic text-lg text-white/90">Together with their families</p>
          <h2 className={`font-bodoni ${nameSize(groom)} text-[#f5dfaa] leading-tight mt-2 drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)]`}>{groom}</h2>
          <p className="font-allura text-4xl text-white/95 my-1">weds</p>
          <h2 className={`font-bodoni ${nameSize(bride)} text-[#f5dfaa] leading-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)]`}>{bride}</h2>
          <div className="gd-float mt-8 text-white/80 text-xs tracking-[0.3em] uppercase">Scroll</div>
        </div>
      </section>

      {/* ===== Scratch-to-reveal date ===== */}
      <section
        className="gd-bg relative min-h-[560px] flex items-center justify-center px-6 py-20 bg-[#fbf3e6] text-[#4a2a10]"
        style={sectionBg(gallery[0], "linear-gradient(rgba(255,248,238,0.86), rgba(255,242,229,0.9))")}
      >
        <div className="text-center w-full">
          <Reveal>
            <h2 className="font-playfair text-4xl text-[#5a2e0e]">Our Special Date</h2>
            <p className="font-cormorant italic text-xl text-[#8a5a1c] mt-2 mb-8">Scratch to reveal the date</p>
          </Reveal>
          <Reveal delay={150}>
            <ScratchCard
              day={weddingDate ? weekdayName(weddingDate).toUpperCase() : "SAVE THE DATE"}
              date={weddingDate ? `${pad(weddingDate.getDate())}-${pad(weddingDate.getMonth() + 1)}-${weddingDate.getFullYear()}` : "Coming soon"}
            />
            <p className="mt-6 font-cormorant text-lg text-[#8a5a1c]">✦ Gently reveal our special date ✦</p>
          </Reveal>
        </div>
      </section>

      {/* ===== Event timeline ===== */}
      <section
        className="gd-bg relative px-5 py-20 bg-gradient-to-b from-[#0f1d3d] to-[#0c1834]"
        style={sectionBg(gallery[1] ?? heroPhoto, "linear-gradient(rgba(13,28,61,0.8), rgba(12,24,52,0.9))")}
      >
        <Reveal>
          <div className="text-center">
            <h2 className="font-playfair text-3xl sm:text-4xl tracking-[0.12em] uppercase text-[#ffe1a0]">Wedding Timeline</h2>
            <p className="font-cormorant italic text-xl text-[#fff1d1] mt-2">
              {events.length === 1
                ? "One beautiful moment · One forever"
                : `${NUMBER_WORDS[events.length] ?? events.length} beautiful moments · One forever`}
            </p>
          </div>
        </Reveal>

        <div className="relative mt-12 max-w-sm mx-auto">
          {events.map((evt, idx) => {
            const isMain = events.length === 1 || /wedding|marriage|muhurtham|nikah/i.test(evt.eventName);
            const date = parseDate(evt.eventDate) ?? (isMain ? weddingDate : null);
            const time = evt.eventTime?.trim() || (isMain ? data.weddingTime?.trim() : "");
            const venue = evt.venue?.trim() || (isMain ? venueName : "");
            const address = venue && venue === venueName ? venueAddress : "";
            const location = [venue, address].filter(Boolean).join(", ");
            const mapsUrl = venue === venueName && data.googleMapsUrl ? data.googleMapsUrl : location ? mapsSearch(location) : null;
            const calUrl = calendarUrl(`${evt.eventName} — ${groom} & ${bride}`, date, time, location, data.welcomeMessage ?? "");
            const photo = photos.length ? photos[idx % photos.length] : null;

            return (
              <Reveal key={evt.id} delay={idx * 120}>
                <article className="relative text-center pb-14 last:pb-0">
                  {idx < events.length - 1 && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 h-12 border-l-2 border-dotted border-[#ffd98e]/50" aria-hidden />
                  )}
                  <div className="mx-auto w-52 h-60 rounded-t-full rounded-b-3xl p-1.5 bg-gradient-to-b from-[#ffe1a0] to-[#b8862f] shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={evt.eventName} className="w-full h-full object-cover rounded-t-full rounded-b-[20px]" />
                    ) : (
                      <div className="w-full h-full rounded-t-full rounded-b-[20px] bg-gradient-to-b from-[#1d2f5c] to-[#0c1834] flex items-center justify-center text-5xl">
                        {idx === 0 ? "💍" : "✦"}
                      </div>
                    )}
                  </div>
                  <h3 className="font-allura text-5xl text-[#ffe0a0] mt-5 leading-none">{evt.eventName}</h3>
                  {date && <p className="font-playfair text-[15px] text-[#fff0c8] mt-3">{longDate(date)}</p>}
                  {time && <p className="font-playfair text-base text-[#ffd98e] mt-1">{time}</p>}
                  {venue && (
                    <p className="font-cormorant text-[17px] text-[#fff4df] mt-3 leading-snug">
                      <span className="font-semibold">{venue}</span>
                      {address && (
                        <>
                          <br />
                          {address}
                        </>
                      )}
                    </p>
                  )}
                  {evt.description && <p className="font-cormorant italic text-base text-[#fff4df]/80 mt-2">{evt.description}</p>}
                  {(mapsUrl || calUrl) && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full bg-[#fff5db]/20 border border-[#ffdc8f]/60 text-[11px] tracking-wider uppercase text-[#fff3cf] hover:bg-[#fff5db]/30 transition-colors"
                        >
                          ⌖ View Location
                        </a>
                      )}
                      {calUrl && (
                        <a
                          href={calUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-full bg-[#fff5db]/20 border border-[#ffdc8f]/60 text-[11px] tracking-wider uppercase text-[#fff3cf] hover:bg-[#fff5db]/30 transition-colors"
                        >
                          ♡ Add to Calendar
                        </a>
                      )}
                    </div>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ===== Countdown ===== */}
      {target && (
        <section
          className="gd-bg relative min-h-[520px] flex items-center justify-center px-5 py-20 bg-gradient-to-b from-[#4a0c18] to-[#2e070f]"
          style={sectionBg(gallery[2] ?? heroPhoto, "linear-gradient(rgba(54,10,20,0.72), rgba(46,7,15,0.85))")}
        >
          <Reveal>
            <div className="text-center">
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#ffd98e]">The big day is getting closer</p>
              <h2 className="font-playfair text-3xl sm:text-4xl text-white mt-3">Counting Down to Forever</h2>
              <p className="font-cormorant italic text-lg text-white/85 mt-2">Every second brings us closer to celebrating with you.</p>

              {left !== null && left > 0 ? (
                <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-3 max-w-sm mx-auto">
                  {[
                    { v: pad(Math.floor(left / 86400000), 3), l: "Days" },
                    { v: pad(Math.floor(left / 3600000) % 24), l: "Hours" },
                    { v: pad(Math.floor(left / 60000) % 60), l: "Minutes" },
                    { v: pad(Math.floor(left / 1000) % 60), l: "Seconds" },
                  ].map((b) => (
                    <div key={b.l} className="rounded-2xl bg-white/10 border border-[#ffd98e]/40 backdrop-blur-sm py-4">
                      <div className="font-bodoni text-2xl sm:text-3xl text-[#ffe1a0] tabular-nums">{b.v}</div>
                      <div className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/80 mt-1">{b.l}</div>
                    </div>
                  ))}
                </div>
              ) : left !== null ? (
                <p className="mt-8 font-allura text-5xl text-[#ffe1a0]">The celebration has begun</p>
              ) : null}

              <p className="mt-6 text-[11px] tracking-[0.3em] uppercase text-white/75">
                {target.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                {data.weddingTime?.trim() && ` · ${data.weddingTime.trim()}`}
              </p>
            </div>
          </Reveal>
        </section>
      )}

      {/* ===== Our story & moments ===== */}
      {(data.loveStory?.trim() || gallery.length > 0) && (
        <section className="relative px-6 py-20 bg-[#fbf3e6] text-[#4a2a10] text-center">
          <Reveal>
            <h2 className="font-playfair text-3xl sm:text-4xl text-[#5a2e0e]">{data.loveStory?.trim() ? "Our Story" : "Our Moments"}</h2>
            {data.loveStory?.trim() && (
              <p className="font-cormorant text-lg leading-relaxed text-[#5a3a1a] mt-4 max-w-md mx-auto">{data.loveStory}</p>
            )}
          </Reveal>
          {gallery.length > 0 && (
            <div className={`mt-10 grid gap-3 max-w-md mx-auto ${gallery.length === 1 ? "grid-cols-1 max-w-[220px]" : gallery.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {gallery.slice(0, 3).map((img, i) => (
                <Reveal key={i} delay={i * 120}>
                  <div className="rounded-t-full rounded-b-2xl p-1 bg-gradient-to-b from-[#e8c77e] to-[#b8862f] shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Moment ${i + 1}`} className="w-full aspect-[3/4] object-cover rounded-t-full rounded-b-xl" loading="lazy" />
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===== A note for guests ===== */}
      <section className="relative px-5 py-20 bg-gradient-to-b from-[#f6e3dc] to-[#e9d3cf] text-[#3a2440]">
        <Reveal>
          <div className="max-w-md mx-auto rounded-3xl bg-white/70 backdrop-blur-sm border border-[#d9b36a]/50 shadow-[0_20px_50px_rgba(58,36,64,0.18)] px-6 py-10 text-center">
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#9a6b2a]">A little note for you</p>
            <h2 className="font-allura text-6xl text-[#7a3b52] mt-3 leading-none">Dear Guest</h2>
            {data.welcomeMessage?.trim() && (
              <p className="font-cormorant text-xl leading-relaxed text-[#3a2440] mt-5">{data.welcomeMessage}</p>
            )}
            {(hasGroomParents || hasBrideParents) && (
              <div className="mt-6 pt-5 border-t border-[#d9b36a]/40 font-cormorant text-base text-[#5a3a50] space-y-1">
                {hasGroomParents && (
                  <p>
                    <span className="font-semibold">{groom}</span>, son of{" "}
                    {[data.groomMotherName?.trim(), data.groomFatherName?.trim()].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasBrideParents && (
                  <p>
                    <span className="font-semibold">{bride}</span>, daughter of{" "}
                    {[data.brideMotherName?.trim(), data.brideFatherName?.trim()].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            )}
            {data.quote?.trim() && <p className="font-cormorant italic text-base text-[#7a3b52] mt-5">&ldquo;{data.quote}&rdquo;</p>}
            <p className="font-cormorant italic text-lg text-[#5a3a50] mt-8">With love,</p>
            <p className="font-allura text-4xl text-[#7a3b52] leading-tight">
              {groom} &amp; {bride}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ===== Footer ===== */}
      <footer className="px-6 py-10 text-center bg-gradient-to-br from-[#102e50] via-[#173a63] to-[#244d72]">
        <p className="font-allura text-4xl text-[#ffe1a0]">
          {groom} &amp; {bride}
        </p>
        {(data.contactDetails?.trim() || data.instagramLink?.trim()) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-white/85">
            {data.contactDetails?.trim() && <span>📞 {data.contactDetails}</span>}
            {data.instagramLink?.trim() && (
              <a href={data.instagramLink} target="_blank" rel="noopener noreferrer" className="underline decoration-[#ffe1a0]/60 hover:text-white">
                Follow our story
              </a>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
