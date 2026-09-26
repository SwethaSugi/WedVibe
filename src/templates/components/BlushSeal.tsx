"use client";

import { useEffect, useRef, useState } from "react";
import { InvitationData, InvitationEvent } from "@/lib/invitation-types";
import { Reveal } from "../Reveal";
import { ScratchCover, sprinkle } from "../ScratchCover";
import { useLiveCountdown, splitDuration } from "../useLiveCountdown";
import { parseDate, weddingMoment, pad, weekdayName, monthName, googleCalendarUrl, mapsSearchUrl } from "../invite-utils";

// Great Vibes runs wide: step long names down so they stay on one line in the two-column block.
const nameSize = (name: string) => (name.length > 12 ? "text-2xl sm:text-3xl" : name.length > 8 ? "text-3xl sm:text-4xl" : "text-[2.4rem] sm:text-5xl");

const DAY_MS = 86400000;

// Lavender foil for the Month / Day / Year scratch tiles.
function lavenderPainter(label: string) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#d9cbee");
    g.addColorStop(0.5, "#c9b8e3");
    g.addColorStop(1, "#b39fd6");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    sprinkle(ctx, w, h, 30, "rgba(255,255,255,0.5)");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#5f4a76";
    ctx.font = "500 16px 'Cormorant Garamond', serif";
    ctx.fillText(label, w / 2, h / 2 - 8);
    ctx.font = "600 8px Montserrat, sans-serif";
    ctx.fillText("SCRATCH", w / 2, h / 2 + 14);
  };
}

function ScratchTile({ label, value }: { label: string; value: string }) {
  const paintRef = useRef(lavenderPainter(label));
  return (
    <ScratchCover
      paint={paintRef.current}
      brush={16}
      threshold={0.4}
      ariaLabel={`Scratch to reveal ${label.toLowerCase()}`}
      className="w-[5.5rem] sm:w-28 h-28 rounded-2xl bg-white border border-[#d8c8e7] shadow-[0_8px_24px_rgba(95,74,118,0.12)]"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
        <span className="text-[9px] tracking-[0.25em] uppercase text-[#8d766c] font-montserrat">{label}</span>
        <strong className="font-cormorant text-2xl font-semibold text-[#342724] mt-1 leading-tight text-center">{value}</strong>
      </div>
    </ScratchCover>
  );
}

// Swipeable photo slider with prev/next buttons and a "01 / 05" counter.
function StorySlider({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const last = photos.length - 1;
  const go = (i: number) => setIndex(Math.max(0, Math.min(last, i)));

  useEffect(() => {
    if (index > last) setIndex(Math.max(0, last));
  }, [index, last]);

  return (
    <div>
      <div
        className="relative mx-auto w-full max-w-[300px] aspect-[3/4] rounded-[28px] overflow-hidden border border-[#dfd4cd] shadow-[0_18px_40px_rgba(52,39,36,0.15)] touch-pan-y select-none"
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (dx < -40) go(index + 1);
          else if (dx > 40) go(index - 1);
          else go(index === last ? 0 : index + 1);
        }}
      >
        <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt={`Our story — ${i + 1}`} draggable={false} className="w-full h-full object-cover shrink-0" />
          ))}
        </div>
      </div>
      {photos.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous photo"
            className="px-4 h-9 rounded-full bg-white border border-[#d8c9c2] text-[#8e3d47] font-montserrat text-[10px] tracking-[0.2em] uppercase disabled:opacity-40 hover:bg-[#fbf3f1] transition"
          >
            Previous
          </button>
          <div className="text-center">
            <div className="font-cormorant text-lg text-[#342724] tabular-nums">
              {pad(index + 1)} / {pad(photos.length)}
            </div>
            <div className="text-[9px] tracking-[0.2em] uppercase text-[#8d766c] font-montserrat">swipe or tap to continue</div>
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === last}
            aria-label="Next photo"
            className="px-4 h-9 rounded-full bg-white border border-[#d8c9c2] text-[#8e3d47] font-montserrat text-[10px] tracking-[0.2em] uppercase disabled:opacity-40 hover:bg-[#fbf3f1] transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// Small ornament used as a section divider.
function Ornament({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 24" className={`w-28 h-6 text-[#8e3d47]/70 ${className}`} fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      <path d="M2 12 H44 M76 12 H118" />
      <path d="M60 3 C54 9 54 15 60 21 C66 15 66 9 60 3 Z" fill="currentColor" fillOpacity="0.15" />
      <circle cx="48" cy="12" r="1.8" fill="currentColor" />
      <circle cx="72" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}

const PETALS = [
  { char: "✦", left: "8%", delay: "0s", dur: "15s", size: "text-sm" },
  { char: "✿", left: "22%", delay: "4s", dur: "19s", size: "text-lg" },
  { char: "•", left: "38%", delay: "8s", dur: "14s", size: "text-base" },
  { char: "✿", left: "58%", delay: "2s", dur: "21s", size: "text-base" },
  { char: "✦", left: "74%", delay: "10s", dur: "17s", size: "text-xs" },
  { char: "•", left: "88%", delay: "6s", dur: "16s", size: "text-sm" },
];

/**
 * BlushSeal — Traditional.
 * A wax seal opens the invitation onto an ivory, wine-rose design: couple names with family
 * lines, Month/Day/Year scratch tiles with a live countdown, a swipeable story slider,
 * day-by-day ceremony cards with map and calendar buttons, and a closing blessing.
 */
export function BlushSeal({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const initials = `${groom.charAt(0)}&${bride.charAt(0)}`;
  const venueName = data.venueName?.trim() || "";
  const venueAddress = data.venueAddress?.trim() || "";

  const [opened, setOpened] = useState(false);
  const [sealGone, setSealGone] = useState(false);
  useEffect(() => {
    if (!opened) return;
    const t = setTimeout(() => setSealGone(true), 1100);
    return () => clearTimeout(t);
  }, [opened]);

  const weddingDate = parseDate(data.weddingDate);
  const target = weddingMoment(data.weddingDate, data.weddingTime);
  const left = useLiveCountdown(target);

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean) ?? [];
  const portraits = [data.coupleImage, data.brideImage, data.groomImage].filter(Boolean) as string[];
  const storyPhotos = gallery.length ? gallery : portraits;
  const eventPhotos = [...portraits, ...gallery];

  const groomParents = [data.groomFatherName?.trim(), data.groomMotherName?.trim()].filter(Boolean).join(" & ");
  const brideParents = [data.brideFatherName?.trim(), data.brideMotherName?.trim()].filter(Boolean).join(" & ");

  const events: InvitationEvent[] = data.events?.length ? data.events : [{ id: "main", eventName: "Wedding" }];
  const eventDates = events.map((e) => parseDate(e.eventDate)).filter(Boolean) as Date[];
  const firstDay = eventDates.length ? Math.min(...eventDates.map((d) => d.getTime())) : null;

  return (
    <div className={`relative w-full bg-white text-[#342724] antialiased font-cormorant ${sealGone ? "" : "max-h-[640px] overflow-hidden"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Great+Vibes&family=Montserrat:wght@400;500;600&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-vibes { font-family: 'Great Vibes', cursive; }
        .font-montserrat { font-family: 'Montserrat', system-ui, sans-serif; }

        @keyframes bs-rise {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.6; }
          100% { transform: translateY(-620px) rotate(160deg); opacity: 0; }
        }
        @keyframes bs-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(155,35,53,0.45), 0 12px 30px rgba(0,0,0,0.45); }
          50% { transform: scale(1.04); box-shadow: 0 0 0 14px rgba(155,35,53,0), 0 12px 30px rgba(0,0,0,0.45); }
        }
        @keyframes bs-drift { 0%, 100% { transform: scale(1.03); } 50% { transform: scale(1.1); } }
        @keyframes bs-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }

        .bs-petal { animation: bs-rise linear infinite; }
        .bs-seal { animation: bs-pulse 2.4s ease-in-out infinite; }
        .bs-drift { animation: bs-drift 18s ease-in-out infinite; }
        .bs-bounce { animation: bs-bounce 1.8s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .bs-petal, .bs-seal, .bs-drift, .bs-bounce { animation: none !important; }
        }
      `}</style>

      {/* Floating petals — absolute so they stay inside the invitation (e.g. the editor preview) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden>
        {PETALS.map((p, i) => (
          <span
            key={i}
            className={`bs-petal absolute text-[#d89aa2] ${p.size}`}
            style={{ left: p.left, top: `${520 + i * 610}px`, animationDelay: p.delay, animationDuration: p.dur }}
          >
            {p.char}
          </span>
        ))}
      </div>

      {/* ===== Wax seal opening ===== */}
      {!sealGone && (
        <div
          className={`absolute inset-x-0 top-0 h-[640px] z-40 overflow-hidden bg-[#1c1214] transition-all duration-1000 ease-in-out ${
            opened ? "opacity-0 -translate-y-8 pointer-events-none" : "opacity-100"
          }`}
        >
          {heroPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroPhoto} alt="" aria-hidden className="bs-drift absolute inset-0 w-full h-full object-cover brightness-[0.45]" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#5e1f2a_0%,_#2a1216_60%,_#1c1214_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/30" />

          <div className="relative h-full flex flex-col items-center justify-between py-20 text-center text-white">
            <div>
              <div className="font-vibes text-6xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">{initials}</div>
              <div className="mt-2 font-montserrat text-[11px] tracking-[0.4em] uppercase text-white/90">Wedding Invitation</div>
            </div>

            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setOpened(true)}
                aria-label="Tap the wax seal to open"
                className={`bs-seal relative w-28 h-28 rounded-full bg-[radial-gradient(circle_at_35%_30%,_#c2394d_0%,_#9b2335_45%,_#5e0f1c_100%)] transition-transform duration-700 ${
                  opened ? "scale-150 opacity-0" : ""
                }`}
              >
                <span className="absolute inset-2 rounded-full border-2 border-[#5e0f1c]/60" />
                <span className="absolute inset-4 rounded-full border border-[#e8a3ad]/30" />
                <span className="relative font-vibes text-4xl text-[#4a0b16] drop-shadow-[0_1px_0_rgba(255,190,200,0.35)]">{initials}</span>
              </button>
              <div className="mt-5 font-montserrat text-[10px] tracking-[0.35em] uppercase text-white/90">Tap the seal to open</div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Invitation ===== */}
      <section className="relative min-h-[640px] flex flex-col items-center justify-center px-6 py-16 text-center">
        <Reveal>
          <Ornament className="mx-auto" />
          <p className="mt-3 font-montserrat text-[10px] tracking-[0.35em] uppercase text-[#8e3d47]">Wedding Invitation</p>
          {data.quote?.trim() && (
            <blockquote className="mt-6 max-w-xs mx-auto font-cormorant italic text-base text-[#342724]/85 leading-relaxed">
              &ldquo;{data.quote.trim()}&rdquo;
            </blockquote>
          )}
          <p className="mt-6 max-w-xs mx-auto font-cormorant text-lg leading-relaxed text-[#544a44]">
            With the blessings of the Almighty and our beloved families, we joyfully invite you to grace the wedding of
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-start gap-3 w-full max-w-sm">
            <div>
              <div className={`font-vibes ${nameSize(groom)} text-[#7d3f39] leading-tight`}>{groom}</div>
              {groomParents && <div className="mt-2 font-cormorant text-sm text-[#5d5048] leading-snug">Son of {groomParents}</div>}
            </div>
            <div className="font-cormorant text-3xl text-[#9a8178] pt-1">&amp;</div>
            <div>
              <div className={`font-vibes ${nameSize(bride)} text-[#7d3f39] leading-tight`}>{bride}</div>
              {brideParents && <div className="mt-2 font-cormorant text-sm text-[#5d5048] leading-snug">Daughter of {brideParents}</div>}
            </div>
          </div>
        </Reveal>

        <div className="bs-bounce mt-12 font-montserrat text-[10px] tracking-[0.3em] uppercase text-[#8d766c]">
          Scroll to reveal
        </div>
      </section>

      {/* ===== Save the date ===== */}
      <section className="relative px-5 py-16 text-center bg-gradient-to-b from-white via-[#fbf6fb] to-white">
        <Reveal>
          <p className="font-montserrat text-[10px] tracking-[0.35em] uppercase text-[#8d766c]">The Date</p>
          <h2 className="font-vibes text-5xl text-[#8e3d47] mt-2">Save the Date</h2>
          <p className="font-cormorant italic text-lg text-[#544a44] mt-2">Scratch below to reveal our wedding date</p>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-8 flex justify-center gap-3">
            <ScratchTile label="Month" value={weddingDate ? monthName(weddingDate) : "—"} />
            <ScratchTile label="Day" value={weddingDate ? String(weddingDate.getDate()) : "—"} />
            <ScratchTile label="Year" value={weddingDate ? String(weddingDate.getFullYear()) : "—"} />
          </div>
        </Reveal>

        <Reveal delay={250}>
          <p className="mt-8 max-w-xs mx-auto font-cormorant italic text-lg text-[#544a44]">
            A new chapter, woven with two hearts and the blessings of family
          </p>
          {weddingDate && (
            <p className="mt-3 font-montserrat text-[10px] tracking-[0.3em] uppercase text-[#8e3d47]">
              {pad(weddingDate.getDate())} · {pad(weddingDate.getMonth() + 1)} · {weddingDate.getFullYear()}
              {venueName && ` · ${venueName}`}
            </p>
          )}

          {left !== null && left > 0 && (
            <div className="mt-8 flex justify-center divide-x divide-[#e7dcd6]">
              {Object.entries(splitDuration(left)).map(([unit, value]) => (
                <div key={unit} className="px-4 sm:px-6">
                  <div className="font-cormorant text-3xl sm:text-4xl text-[#342724] tabular-nums">{pad(value)}</div>
                  <div className="font-montserrat text-[9px] tracking-[0.25em] uppercase text-[#8d766c] mt-1">
                    {unit === "minutes" ? "Mins" : unit === "seconds" ? "Secs" : unit}
                  </div>
                </div>
              ))}
            </div>
          )}
          {left !== null && left <= 0 && <p className="mt-8 font-vibes text-4xl text-[#8e3d47]">The celebration has begun</p>}
        </Reveal>
      </section>

      {/* ===== Our story ===== */}
      {(data.loveStory?.trim() || storyPhotos.length > 0) && (
        <section className="relative px-5 py-16 text-center">
          <Reveal>
            <p className="font-montserrat text-[10px] tracking-[0.35em] uppercase text-[#8d766c]">Our Story</p>
            <h2 className="font-vibes text-5xl text-[#8e3d47] mt-2 leading-tight">Our Little Story</h2>
            {data.loveStory?.trim() && (
              <p className="mt-4 max-w-sm mx-auto font-cormorant text-lg leading-relaxed text-[#544a44]">{data.loveStory.trim()}</p>
            )}
          </Reveal>
          {storyPhotos.length > 0 && (
            <Reveal delay={150}>
              <div className="mt-8">
                <StorySlider photos={storyPhotos} />
              </div>
            </Reveal>
          )}
        </section>
      )}

      {/* ===== Ceremonies ===== */}
      <section className="relative px-5 py-16 text-center bg-gradient-to-b from-white via-[#fdf7f5] to-white">
        <Reveal>
          <p className="font-montserrat text-[10px] tracking-[0.35em] uppercase text-[#8d766c]">The Celebrations Unfold</p>
          <h2 className="font-vibes text-5xl text-[#8e3d47] mt-2">The Ceremonies</h2>
        </Reveal>

        <div className="mt-10 space-y-14 max-w-sm mx-auto">
          {events.map((evt, idx) => {
            const isMain = events.length === 1 || /wedding|marriage|muhurtham|nikah/i.test(evt.eventName);
            const date = parseDate(evt.eventDate) ?? (isMain ? weddingDate : null);
            const time = evt.eventTime?.trim() || (isMain ? data.weddingTime?.trim() : "");
            const venue = evt.venue?.trim() || (isMain ? venueName : "");
            const address = venue && venue === venueName ? venueAddress : "";
            const location = [venue, address].filter(Boolean).join(", ");
            const mapsUrl = venue === venueName && data.googleMapsUrl ? data.googleMapsUrl : location ? mapsSearchUrl(location) : null;
            const calUrl = googleCalendarUrl(`${evt.eventName} — ${groom} & ${bride}`, date, time, location, data.welcomeMessage ?? "");
            const dayNumber = date && firstDay !== null ? Math.round((date.getTime() - firstDay) / DAY_MS) + 1 : null;
            const photo = eventPhotos.length ? eventPhotos[idx % eventPhotos.length] : null;

            return (
              <Reveal key={evt.id} delay={idx * 100}>
                <article>
                  <div className="flex items-center gap-3 mb-5" aria-label={dayNumber ? `Day ${dayNumber} ${evt.eventName}` : evt.eventName}>
                    <span className="h-px flex-1 bg-[#e3d6cf]" />
                    <span className="font-montserrat text-[10px] tracking-[0.3em] uppercase text-[#8d766c]">
                      {dayNumber ? `Day ${dayNumber}` : `Ceremony ${idx + 1}`}
                    </span>
                    <b className="font-cormorant text-lg font-semibold text-[#8e3d47]">{evt.eventName}</b>
                    <span className="h-px flex-1 bg-[#e3d6cf]" />
                  </div>

                  {photo && (
                    <div className="rounded-3xl overflow-hidden h-60 shadow-[0_14px_36px_rgba(52,39,36,0.18)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt={evt.eventName} className="bs-drift w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}

                  <div className={`relative ${photo ? "-mt-8 mx-3" : ""} rounded-3xl bg-white border border-[#dfd4cd] px-5 py-7 shadow-[0_10px_30px_rgba(52,39,36,0.08)]`}>
                    {date && (
                      <div className="font-montserrat text-[10px] tracking-[0.25em] uppercase text-[#a08478]">
                        {weekdayName(date)} · {date.getDate()} {monthName(date)} {date.getFullYear()}
                      </div>
                    )}
                    <h3 className="font-vibes text-5xl text-[#8e3d47] mt-2 leading-tight">{evt.eventName}</h3>
                    {time && <p className="mt-1 font-cormorant text-lg text-[#342724]">{time}</p>}
                    {venue && (
                      <p className="mt-3 font-cormorant text-base text-[#544a44] leading-snug">
                        <span className="font-semibold text-[#342724]">{venue}</span>
                        {address && (
                          <>
                            <br />
                            {address}
                          </>
                        )}
                      </p>
                    )}
                    {evt.description?.trim() && <p className="mt-3 font-cormorant italic text-base text-[#6d6058]">{evt.description.trim()}</p>}
                    {(mapsUrl || calUrl) && (
                      <div className="mt-5 flex flex-col items-center gap-2">
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full max-w-[220px] py-2.5 rounded-full bg-[#8d3b45] text-white font-montserrat text-[10px] tracking-[0.25em] uppercase hover:bg-[#7a2f39] transition-colors"
                          >
                            ⌖ &nbsp;View on Map
                          </a>
                        )}
                        {calUrl && (
                          <a
                            href={calUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full max-w-[220px] py-2.5 rounded-full border border-[#8d3b45]/50 text-[#8d3b45] font-montserrat text-[10px] tracking-[0.25em] uppercase hover:bg-[#fbf3f1] transition-colors"
                          >
                            ♡ &nbsp;Add to Calendar
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ===== Closing blessing ===== */}
      <section className="relative px-6 py-20 text-center">
        <Reveal>
          <svg viewBox="0 0 64 40" className="w-16 h-10 mx-auto text-[#8e3d47]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="24" cy="22" r="13" />
            <circle cx="40" cy="22" r="13" />
            <path d="M38 5 l2 -3 l2 3 l-2 2 z" fill="currentColor" />
          </svg>
          {data.welcomeMessage?.trim() && (
            <p className="mt-6 max-w-sm mx-auto font-cormorant text-lg leading-relaxed text-[#544a44]">{data.welcomeMessage.trim()}</p>
          )}
          <p className="mt-4 max-w-sm mx-auto font-cormorant italic text-lg text-[#544a44]">
            We cannot wait to celebrate this beautiful chapter with you.
          </p>
          <div className="mt-6 font-vibes text-5xl sm:text-6xl text-[#7d3f39] leading-tight">
            {groom} &amp; {bride}
          </div>
        </Reveal>
      </section>

      {(data.contactDetails?.trim() || data.instagramLink?.trim()) && (
        <footer className="border-t border-[#efe6e2] px-6 py-8 text-center font-montserrat text-xs text-[#6d6058] space-y-3">
          {data.contactDetails?.trim() && <p>📞 {data.contactDetails.trim()}</p>}
          {data.instagramLink?.trim() && (
            <a
              href={data.instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded-full border border-[#dfd4cd] text-[#8e3d47] hover:bg-[#fbf3f1] transition-colors"
            >
              Follow our story
            </a>
          )}
        </footer>
      )}
    </div>
  );
}
