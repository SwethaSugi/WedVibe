"use client";

import { useEffect, useState, type ReactNode } from "react";
import { InvitationData, InvitationEvent } from "@/lib/invitation-types";
import { Reveal } from "../Reveal";
import { useLiveCountdown, splitDuration } from "../useLiveCountdown";
import { parseDate, weddingMoment, pad, weekdayName, monthName, googleCalendarUrl, mapsSearchUrl } from "../invite-utils";

// Great Vibes runs wide: step long names down so "Name & Name" fits on phones.
const heroNameSize = (a: string, b: string) => {
  const len = a.length + b.length;
  return len > 22 ? "text-4xl sm:text-5xl" : len > 15 ? "text-5xl sm:text-6xl" : "text-6xl sm:text-7xl";
};

// "Engagement" -> "Engagement Ceremony"; leaves names that already say ceremony/reception alone.
const ceremonyLabel = (name: string) => (/ceremony|reception|celebration|party/i.test(name) ? name : `${name} Ceremony`);

function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`font-dmsans text-[10px] tracking-[0.35em] uppercase ${className}`}>{children}</p>;
}

function GoldRule() {
  return <div className="mx-auto my-5 h-px w-24 bg-gradient-to-r from-transparent via-[#e0bd78] to-transparent" aria-hidden />;
}

/**
 * MidnightPromise — Engagement.
 * Black, champagne-gold and blush: a glowing ring opens the invitation onto a veiled couple
 * photo, a "promise of forever" panel, a live countdown, ceremony details with map and
 * calendar buttons, a photo gallery, a message to family & friends and directions.
 */
export function MidnightPromise({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venueName = data.venueName?.trim() || "";
  const venueAddress = data.venueAddress?.trim() || "";

  const [opened, setOpened] = useState(false);
  const [openingGone, setOpeningGone] = useState(false);
  useEffect(() => {
    if (!opened) return;
    const t = setTimeout(() => setOpeningGone(true), 1100);
    return () => clearTimeout(t);
  }, [opened]);

  const weddingDate = parseDate(data.weddingDate);
  const target = weddingMoment(data.weddingDate, data.weddingTime);
  const left = useLiveCountdown(target);

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean) ?? [];

  const events: InvitationEvent[] = data.events?.length ? data.events : [{ id: "main", eventName: "Wedding" }];
  const headline = ceremonyLabel(events[0].eventName?.trim() || "Wedding");

  const groomParents = [data.groomMotherName?.trim(), data.groomFatherName?.trim()].filter(Boolean).join(" & ");
  const brideParents = [data.brideMotherName?.trim(), data.brideFatherName?.trim()].filter(Boolean).join(" & ");

  const mainLocation = [venueName, venueAddress].filter(Boolean).join(", ");
  const mainMapsUrl = data.googleMapsUrl?.trim() || (mainLocation ? mapsSearchUrl(mainLocation) : null);

  return (
    <div className={`relative w-full bg-[#070707] text-[#f7eee6] antialiased font-dmsans ${openingGone ? "" : "max-h-[640px] overflow-hidden"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500;600&family=Great+Vibes&display=swap');
        .font-dmsans { font-family: 'DM Sans', system-ui, sans-serif; }
        .font-vibes { font-family: 'Great Vibes', cursive; }
        .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif; }

        @keyframes mp-glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(224,189,120,0.45)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 26px rgba(242,211,154,0.9)); transform: scale(1.05); }
        }
        @keyframes mp-halo { 0% { transform: scale(0.8); opacity: 0.7; } 100% { transform: scale(1.8); opacity: 0; } }
        @keyframes mp-drift { 0%, 100% { transform: scale(1.04); } 50% { transform: scale(1.1); } }
        @keyframes mp-twinkle { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.9; } }
        @keyframes mp-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }

        .mp-ring { animation: mp-glow 2.6s ease-in-out infinite; }
        .mp-halo { animation: mp-halo 2.4s ease-out infinite; }
        .mp-drift { animation: mp-drift 20s ease-in-out infinite; }
        .mp-star { animation: mp-twinkle 3s ease-in-out infinite; }
        .mp-bounce { animation: mp-bounce 1.8s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .mp-ring, .mp-halo, .mp-drift, .mp-star, .mp-bounce { animation: none !important; }
        }
      `}</style>

      {/* ===== Opening: touch the ring ===== */}
      {!openingGone && (
        <div
          className={`absolute inset-x-0 top-0 h-[640px] z-40 overflow-hidden bg-[#080606] transition-all duration-1000 ${
            opened ? "opacity-0 scale-105 pointer-events-none" : "opacity-100"
          }`}
        >
          {heroPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroPhoto} alt="" aria-hidden className="mp-drift absolute inset-0 w-full h-full object-cover brightness-[0.3] blur-[2px]" />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(166,120,53,0.25)_0%,_rgba(8,6,6,0.7)_55%,_#080606_100%)]" />
          {[
            [12, 14], [80, 10], [30, 30], [70, 38], [18, 70], [86, 72], [50, 88], [60, 20],
          ].map(([x, y], i) => (
            <span key={i} className="mp-star absolute w-1 h-1 rounded-full bg-[#f2d39a]" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.35}s` }} />
          ))}

          <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            <Eyebrow className="text-[#e0bd78]">You are invited</Eyebrow>
            <p className="font-vibes text-5xl text-[#f2d39a] mt-3">
              {groom.charAt(0)} &amp; {bride.charAt(0)}
            </p>

            <button
              type="button"
              onClick={() => setOpened(true)}
              aria-label="Touch the ring to open the invitation"
              className={`relative mt-10 w-32 h-32 flex items-center justify-center transition-all duration-700 ${opened ? "scale-150 opacity-0" : ""}`}
            >
              <span className="mp-halo absolute inset-4 rounded-full border border-[#f2d39a]/60" />
              <svg viewBox="0 0 100 80" className="mp-ring w-28 h-24" fill="none" aria-hidden>
                <defs>
                  <linearGradient id="mpGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fff1c9" />
                    <stop offset="0.5" stopColor="#e0bd78" />
                    <stop offset="1" stopColor="#a67835" />
                  </linearGradient>
                </defs>
                <circle cx="38" cy="46" r="22" stroke="url(#mpGold)" strokeWidth="5" />
                <circle cx="62" cy="46" r="22" stroke="url(#mpGold)" strokeWidth="5" />
                <path d="M62 14 l6 -8 l6 8 l-6 6 z" fill="#fff6dc" />
                <path d="M62 14 l6 -8 l6 8" stroke="#e0bd78" strokeWidth="1" />
              </svg>
            </button>
            <p className="mt-6 font-dmsans text-[10px] tracking-[0.35em] uppercase text-[#f7eee6]/85">Touch the ring to open</p>
          </div>
        </div>
      )}

      {/* ===== Hero ===== */}
      <section className="relative h-[640px] flex items-end overflow-hidden">
        {heroPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroPhoto} alt={`${groom} and ${bride}`} className="mp-drift absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#3a2a18_0%,_#120d0a_55%,_#070707_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/55 to-black/25" />
        <div className="relative w-full px-6 pb-12 text-center">
          <Eyebrow className="text-[#e0bd78]">You are invited to celebrate</Eyebrow>
          <h1 className={`font-vibes ${heroNameSize(groom, bride)} text-[#f2d39a] leading-tight mt-3 drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)]`}>
            {groom} <i className="font-cormorant not-italic text-4xl align-middle text-[#e0bd78]">&amp;</i> {bride}
          </h1>
          <p className="font-vibes text-3xl text-[#f7eee6]/90 mt-1">A beautiful beginning</p>
          {weddingDate && (
            <p className="mt-5 font-cormorant text-xl tracking-[0.25em] text-[#f7eee6]">
              {weddingDate.getDate()} · {monthName(weddingDate).toUpperCase()} · {weddingDate.getFullYear()}
            </p>
          )}
          <Eyebrow className="text-[#e0bd78] mt-3">{headline}</Eyebrow>
          <a href="#mp-promise" className="mp-bounce inline-block mt-8 font-dmsans text-[10px] tracking-[0.3em] uppercase text-[#f7eee6]/80">
            Scroll to explore ↓
          </a>
        </div>
      </section>

      {/* ===== A promise of forever ===== */}
      <section id="mp-promise" className="px-6 py-20 bg-[#f8eee8] text-[#4b3839] text-center">
        <Reveal>
          <Eyebrow className="text-[#a67835]">A promise of forever</Eyebrow>
          <h2 className="mt-5 font-cormorant text-4xl leading-tight text-[#3a2a2b]">
            I Have Found
            <br />
            The One Whom
            <br />
            <span className="font-vibes text-5xl text-[#a67835]">my soul loves.</span>
          </h2>
          <div className="my-6 text-[#a67835] text-xl" aria-hidden>
            ♡
          </div>
          {data.quote?.trim() && (
            <blockquote className="max-w-sm mx-auto font-cormorant italic text-xl text-[#4b3839]">&ldquo;{data.quote.trim()}&rdquo;</blockquote>
          )}
          {data.welcomeMessage?.trim() && (
            <p className="mt-5 max-w-sm mx-auto font-cormorant text-lg leading-relaxed text-[#4b3839]">{data.welcomeMessage.trim()}</p>
          )}
          {(groomParents || brideParents) && (
            <div className="mt-8 pt-6 border-t border-[#a67835]/25 max-w-sm mx-auto font-cormorant text-base text-[#5b4546] space-y-1">
              {groomParents && (
                <p>
                  <span className="font-semibold">{groom}</span>, son of {groomParents}
                </p>
              )}
              {brideParents && (
                <p>
                  <span className="font-semibold">{bride}</span>, daughter of {brideParents}
                </p>
              )}
            </div>
          )}
        </Reveal>
      </section>

      {/* ===== Save the date / countdown ===== */}
      {target && (
        <section className="px-6 py-20 bg-[#0d0d0d] text-center">
          <Reveal>
            <Eyebrow className="text-[#e0bd78]">Our special day</Eyebrow>
            <h2 className="font-vibes text-5xl text-[#f2d39a] mt-3">Save the Date</h2>
            {left !== null && left > 0 ? (
              <div className="mt-8 grid grid-cols-4 gap-2 max-w-sm mx-auto">
                {Object.entries(splitDuration(left)).map(([unit, value]) => (
                  <div key={unit} className="rounded-2xl border border-[#bd9150]/40 bg-white/[0.03] py-4">
                    <div className="font-cormorant text-3xl text-[#f2d39a] tabular-nums">{pad(value)}</div>
                    <div className="font-dmsans text-[9px] tracking-[0.25em] uppercase text-[#f7eee6]/70 mt-1">{unit}</div>
                  </div>
                ))}
              </div>
            ) : left !== null ? (
              <p className="mt-8 font-vibes text-4xl text-[#f2d39a]">The celebration has begun</p>
            ) : null}
            {weddingDate && (
              <p className="mt-8 font-cormorant text-2xl tracking-[0.2em] text-[#f7eee6]">
                {weddingDate.getDate()} <span className="text-[#bd9150]">|</span> {monthName(weddingDate).toUpperCase()}{" "}
                <span className="text-[#bd9150]">|</span> {weddingDate.getFullYear()}
              </p>
            )}
            {data.weddingTime?.trim() && <p className="mt-2 font-dmsans text-sm text-[#f7eee6]/75">{data.weddingTime.trim()}</p>}
          </Reveal>
        </section>
      )}

      {/* ===== The celebration: event details ===== */}
      <section className="px-5 py-20 bg-[#101010] text-[#eee0d5] text-center">
        <Reveal>
          <Eyebrow className="text-[#e0bd78]">The celebration</Eyebrow>
          <h2 className="font-vibes text-5xl text-[#f2d39a] mt-3">{events.length === 1 ? headline : "The Ceremonies"}</h2>
        </Reveal>
        <div className="mt-10 space-y-8 max-w-sm mx-auto">
          {events.map((evt, idx) => {
            const isMain = events.length === 1 || /wedding|marriage|engagement|muhurtham|nikah/i.test(evt.eventName);
            const date = parseDate(evt.eventDate) ?? (isMain ? weddingDate : null);
            const time = evt.eventTime?.trim() || (isMain ? data.weddingTime?.trim() : "");
            const venue = evt.venue?.trim() || (isMain ? venueName : "");
            const address = venue && venue === venueName ? venueAddress : "";
            const location = [venue, address].filter(Boolean).join(", ");
            const mapsUrl = venue === venueName && data.googleMapsUrl ? data.googleMapsUrl : location ? mapsSearchUrl(location) : null;
            const calUrl = googleCalendarUrl(`${evt.eventName} — ${groom} & ${bride}`, date, time, location, data.welcomeMessage ?? "");

            return (
              <Reveal key={evt.id} delay={idx * 100}>
                <article className="rounded-3xl border border-[#bd9150]/35 bg-gradient-to-b from-white/[0.05] to-transparent px-5 py-7">
                  {events.length > 1 && <h3 className="font-vibes text-4xl text-[#f2d39a] mb-4">{evt.eventName}</h3>}
                  <dl className="divide-y divide-white/10 text-left">
                    {date && (
                      <div className="flex justify-between gap-4 py-3">
                        <dt className="font-dmsans text-[10px] tracking-[0.3em] uppercase text-[#e0bd78] pt-1">Date</dt>
                        <dd className="text-right font-cormorant text-lg">
                          {date.getDate()} {monthName(date)} {date.getFullYear()}
                          <span className="block text-sm text-[#eee0d5]/65">{weekdayName(date)}</span>
                        </dd>
                      </div>
                    )}
                    {time && (
                      <div className="flex justify-between gap-4 py-3">
                        <dt className="font-dmsans text-[10px] tracking-[0.3em] uppercase text-[#e0bd78] pt-1">Time</dt>
                        <dd className="text-right font-cormorant text-lg">{time}</dd>
                      </div>
                    )}
                    {venue && (
                      <div className="flex justify-between gap-4 py-3">
                        <dt className="font-dmsans text-[10px] tracking-[0.3em] uppercase text-[#e0bd78] pt-1">Location</dt>
                        <dd className="text-right font-cormorant text-lg leading-snug">
                          {venue}
                          {address && <span className="block text-sm text-[#eee0d5]/65">{address}</span>}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {evt.description?.trim() && <p className="mt-4 font-cormorant italic text-base text-[#eee0d5]/75">{evt.description.trim()}</p>}
                  {(mapsUrl || calUrl) && (
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#f2d39a] to-[#bd9150] text-[#1a1208] font-dmsans text-[10px] font-semibold tracking-[0.25em] uppercase hover:brightness-110 transition"
                        >
                          View Location ↗
                        </a>
                      )}
                      {calUrl && (
                        <a
                          href={calUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 rounded-full border border-[#bd9150]/60 text-[#f2d39a] font-dmsans text-[10px] font-semibold tracking-[0.25em] uppercase hover:bg-white/5 transition"
                        >
                          Add to Calendar
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

      {/* ===== Our moments ===== */}
      {(gallery.length > 0 || data.loveStory?.trim()) && (
        <section className="px-5 py-20 bg-[#171212] text-center">
          <Reveal>
            <Eyebrow className="text-[#e0bd78]">A few memories</Eyebrow>
            <h2 className="font-vibes text-5xl text-[#f2d39a] mt-3">{gallery.length ? "Our Moments" : "Our Story"}</h2>
            {data.loveStory?.trim() && (
              <p className="mt-4 max-w-sm mx-auto font-cormorant text-lg leading-relaxed text-[#eee0d5]/85">{data.loveStory.trim()}</p>
            )}
          </Reveal>
          {gallery.length > 0 && (
            <div className={`mt-8 grid gap-3 max-w-sm mx-auto ${gallery.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {gallery.slice(0, 3).map((img, i) => (
                <Reveal key={i} delay={i * 100} className={gallery.length === 3 && i === 0 ? "col-span-2" : ""}>
                  <div className="rounded-2xl overflow-hidden border border-[#bd9150]/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Moment ${i + 1}`}
                      loading="lazy"
                      className={`w-full object-cover hover:scale-105 transition-transform duration-700 ${gallery.length === 3 && i === 0 ? "h-56" : "h-44"}`}
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===== Message to family & friends ===== */}
      <section className="px-6 py-20 bg-[#0d0d0d] text-[#f5e8dc] text-center">
        <Reveal>
          <Eyebrow className="text-[#e0bd78]">With love</Eyebrow>
          <h2 className="font-vibes text-5xl text-[#f2d39a] mt-3 leading-tight">To Our Family &amp; Friends</h2>
          <div className="my-5 text-[#e0bd78] text-xl" aria-hidden>
            ♡
          </div>
          <p className="max-w-sm mx-auto font-cormorant text-lg leading-relaxed">
            Your presence will make this special celebration even more meaningful. We would be delighted to have you join us as we celebrate
            this beautiful new beginning.
          </p>
          <p className="mt-4 font-cormorant italic text-lg text-[#f5e8dc]/85">We can&apos;t wait to celebrate with you.</p>
          <GoldRule />
          <p className="font-vibes text-5xl text-[#f2d39a] leading-tight">
            {groom} &amp; {bride}
          </p>
        </Reveal>
      </section>

      {/* ===== Directions ===== */}
      {venueName && (
        <section className="px-6 py-20 bg-[#f5e7df] text-[#4b3839] text-center">
          <Reveal>
            <Eyebrow className="text-[#a67835]">Find your way</Eyebrow>
            <h2 className="font-vibes text-5xl text-[#a67835] mt-3">Directions</h2>
            <div className="mt-8 max-w-sm mx-auto rounded-3xl bg-white/80 border border-[#a67835]/25 px-6 py-7 shadow-[0_14px_40px_rgba(75,56,57,0.12)]">
              <p className="font-cormorant text-2xl text-[#3a2a2b] flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#a67835]" aria-hidden />
                {venueName}
              </p>
              {venueAddress && <p className="mt-1 font-cormorant text-lg text-[#5b4546]">{venueAddress}</p>}
              {mainMapsUrl && (
                <a
                  href={mainMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-6 px-6 py-3 rounded-full bg-[#1a1208] text-[#f2d39a] font-dmsans text-[10px] font-semibold tracking-[0.25em] uppercase hover:bg-black transition-colors"
                >
                  Open in Google Maps ↗
                </a>
              )}
            </div>
          </Reveal>
        </section>
      )}

      {/* ===== Footer ===== */}
      <footer className="px-6 py-14 bg-[#080808] text-center">
        <p className="font-vibes text-5xl text-[#f2d39a] leading-tight">
          {groom} &amp; {bride}
        </p>
        {weddingDate && (
          <p className="mt-3 font-cormorant text-lg tracking-[0.3em] text-[#eeeeee]/80">
            {pad(weddingDate.getDate())} · {pad(weddingDate.getMonth() + 1)} · {weddingDate.getFullYear()}
          </p>
        )}
        {(data.contactDetails?.trim() || data.instagramLink?.trim()) && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-[#eeeeee]/75">
            {data.contactDetails?.trim() && <span>📞 {data.contactDetails.trim()}</span>}
            {data.instagramLink?.trim() && (
              <a href={data.instagramLink} target="_blank" rel="noopener noreferrer" className="underline decoration-[#e0bd78]/60 hover:text-white">
                Follow our story
              </a>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
