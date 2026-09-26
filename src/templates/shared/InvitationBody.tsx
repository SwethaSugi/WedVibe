"use client";

// Shared building blocks for the "opening cover" templates: each template supplies its own
// opening animation, hero and colours (an InviteTheme); these pieces render the couple's data
// the same way everywhere, so fixes and new fields apply to every template at once.

import { useEffect, useState, type ReactNode } from "react";
import type { InvitationData } from "@/lib/invitation-types";
import { Reveal } from "../Reveal";
import { ScratchCover } from "../ScratchCover";
import { useLiveCountdown, splitDuration } from "../useLiveCountdown";
import { parseDate, weddingMoment, pad, weekdayName, monthName, resolveEvent } from "../invite-utils";

// ---------- opening cover ----------

/** Height of the opening cover; the invitation is clipped to it until the cover is opened. */
export const COVER_HEIGHT = "h-[640px]";

/** State for an opening cover: `opened` starts the animation, `gone` unmounts it afterwards. */
export function useOpening(animationMs = 1400) {
  const [opened, setOpened] = useState(false);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (!opened) return;
    const t = setTimeout(() => setGone(true), animationMs);
    return () => clearTimeout(t);
  }, [opened, animationMs]);
  return { opened, gone, open: () => setOpened(true) };
}

/** Root classes: clip the invitation to the cover's height until the cover is gone. */
export const rootClip = (gone: boolean) => (gone ? "" : "max-h-[640px] overflow-hidden");

// ---------- theme ----------

export interface InviteTheme {
  section: string; // background + text colour of content sections
  text: string; // main body text colour
  muted: string; // secondary text colour
  accent: string; // accent text colour (eyebrows, labels)
  heading: string; // section heading font + colour
  body: string; // body font
  card: string; // card surface (bg + border + radius)
  divider: string; // border colour for hairlines
  button: string; // primary button
  ghostButton: string; // secondary/outline button
  countBox: string; // countdown box surface
  countNumber: string; // countdown number font + colour
  scratchSurface: string; // what's under the scratch foil
  scratchPaint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  gallery?: "slider" | "grid";
}

export interface BodyLabels {
  familyGroom?: string;
  familyBride?: string;
  scratchTitle?: string;
  scratchHint?: string;
  countdownTitle?: string;
  storyTitle?: string;
  galleryTitle?: string;
  eventsTitle?: string;
  venueTitle?: string;
  closingLine?: string;
}

// Long names step down a size so words don't split on phones.
export const nameSize = (name: string, sizes = ["text-3xl sm:text-4xl", "text-4xl sm:text-5xl", "text-5xl sm:text-6xl"]) =>
  name.length > 16 ? sizes[0] : name.length > 10 ? sizes[1] : sizes[2];

export function coupleNames(data: InvitationData) {
  return {
    groom: data.groomName?.trim() || "Groom Name",
    bride: data.brideName?.trim() || "Bride Name",
  };
}

/** A foil painter: gradient stops + a centred label, with a light sparkle. */
export function foilPainter(stops: string[], label: string, labelColor: string) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    stops.forEach((c, i) => g.addColorStop(i / Math.max(1, stops.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    for (let i = 0; i < 70; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = labelColor;
    ctx.font = "600 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, w / 2, h / 2);
  };
}

// ---------- hero ----------

/** Full-height photo hero; shows `fallback` when the couple hasn't uploaded a photo. */
export function PhotoHero({
  photo,
  alt,
  overlay,
  fallback,
  children,
  imgClassName = "",
}: {
  photo?: string;
  alt: string;
  overlay: string;
  fallback: string;
  children: ReactNode;
  imgClassName?: string;
}) {
  return (
    <section className="relative h-[640px] flex flex-col justify-end overflow-hidden">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={alt} className={`absolute inset-0 w-full h-full object-cover ${imgClassName}`} />
      ) : (
        <div className={`absolute inset-0 ${fallback}`} />
      )}
      <div className={`absolute inset-0 ${overlay}`} />
      <div className="relative px-6 pb-14 text-center">{children}</div>
    </section>
  );
}

// ---------- body ----------

function SectionTitle({ theme, eyebrow, title }: { theme: InviteTheme; eyebrow?: string; title: string }) {
  return (
    <div className="text-center mb-6">
      {eyebrow && <p className={`text-[10px] uppercase tracking-[0.3em] ${theme.accent}`}>{eyebrow}</p>}
      <h2 className={`${theme.heading} text-3xl mt-1`}>{title}</h2>
    </div>
  );
}

function GallerySlider({ photos, theme }: { photos: string[]; theme: InviteTheme }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % photos.length), 3500);
    return () => clearInterval(t);
  }, [photos.length]);

  return (
    <div>
      <div className="relative h-72 rounded-3xl overflow-hidden shadow-xl">
        {photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`Moment ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      {photos.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? `w-6 bg-current ${theme.accent}` : "w-1.5 bg-current opacity-30"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Everything below the hero: family, scratch date, countdown, message, story, events, venue, closing. */
export function InvitationBody({ data, theme, labels = {} }: { data: InvitationData; theme: InviteTheme; labels?: BodyLabels }) {
  const { groom, bride } = coupleNames(data);
  const weddingDate = parseDate(data.weddingDate);
  const target = weddingMoment(data.weddingDate, data.weddingTime);
  const left = useLiveCountdown(target);

  const groomParents = [data.groomMotherName?.trim(), data.groomFatherName?.trim()].filter(Boolean).join(" & ");
  const brideParents = [data.brideMotherName?.trim(), data.brideFatherName?.trim()].filter(Boolean).join(" & ");
  const gallery = data.galleryImages?.filter(Boolean).slice(0, 3) ?? [];
  const events = data.events?.length ? data.events : [{ id: "main", eventName: "Wedding" }];
  const venueName = data.venueName?.trim() || "";
  const venueAddress = data.venueAddress?.trim() || "";
  const mainMaps = data.googleMapsUrl?.trim() || null;

  return (
    <div className={`${theme.section} ${theme.body} px-5 py-16 space-y-14`}>
      {/* Families */}
      {(groomParents || brideParents) && (
        <Reveal>
          <div className={`${theme.card} p-5 grid ${groomParents && brideParents ? "grid-cols-2" : "grid-cols-1"} gap-4 text-center`}>
            {groomParents && (
              <div>
                <p className={`text-[10px] uppercase tracking-[0.25em] ${theme.accent}`}>{labels.familyGroom ?? "Groom's Family"}</p>
                <p className={`mt-1.5 text-sm ${theme.text}`}>Son of {groomParents}</p>
              </div>
            )}
            {brideParents && (
              <div>
                <p className={`text-[10px] uppercase tracking-[0.25em] ${theme.accent}`}>{labels.familyBride ?? "Bride's Family"}</p>
                <p className={`mt-1.5 text-sm ${theme.text}`}>Daughter of {brideParents}</p>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* Scratch-to-reveal date */}
      <Reveal>
        <SectionTitle theme={theme} eyebrow="Save the date" title={labels.scratchTitle ?? "Our Special Day"} />
        <ScratchCover
          paint={theme.scratchPaint}
          ariaLabel="Scratch to reveal the wedding date"
          className={`w-full max-w-sm h-44 mx-auto rounded-3xl ${theme.scratchSurface}`}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            {weddingDate ? (
              <>
                <p className={`text-[10px] uppercase tracking-[0.3em] ${theme.accent}`}>{weekdayName(weddingDate)}</p>
                <p className={`${theme.heading} text-3xl sm:text-4xl mt-1`}>
                  {weddingDate.getDate()} {monthName(weddingDate)} {weddingDate.getFullYear()}
                </p>
                {data.weddingTime?.trim() && <p className={`mt-1 text-sm ${theme.muted}`}>{data.weddingTime.trim()}</p>}
                {venueName && <p className={`mt-1 text-sm ${theme.text}`}>{venueName}</p>}
              </>
            ) : (
              <p className={`${theme.heading} text-2xl`}>Date to be announced</p>
            )}
          </div>
        </ScratchCover>
        <p className={`mt-3 text-center text-xs ${theme.muted}`}>{labels.scratchHint ?? "Gently scratch the foil to reveal the date"}</p>
      </Reveal>

      {/* Countdown */}
      {target && left !== null && (
        <Reveal>
          <p className={`text-center text-[10px] uppercase tracking-[0.3em] mb-4 ${theme.accent}`}>{labels.countdownTitle ?? "Counting down to forever"}</p>
          {left > 0 ? (
            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
              {Object.entries(splitDuration(left)).map(([unit, value]) => (
                <div key={unit} className={`${theme.countBox} py-3 text-center`}>
                  <div className={`${theme.countNumber} text-2xl sm:text-3xl tabular-nums`}>{pad(value)}</div>
                  <div className={`text-[9px] uppercase tracking-[0.2em] mt-1 ${theme.muted}`}>{unit}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`${theme.heading} text-center text-3xl`}>The celebration has begun</p>
          )}
        </Reveal>
      )}

      {/* Welcome + quote */}
      {(data.welcomeMessage?.trim() || data.quote?.trim()) && (
        <Reveal>
          <div className="text-center max-w-md mx-auto space-y-4">
            {data.welcomeMessage?.trim() && <p className={`text-lg leading-relaxed ${theme.text}`}>{data.welcomeMessage.trim()}</p>}
            {data.quote?.trim() && <p className={`italic ${theme.muted}`}>&ldquo;{data.quote.trim()}&rdquo;</p>}
          </div>
        </Reveal>
      )}

      {/* Story + gallery */}
      {(data.loveStory?.trim() || gallery.length > 0) && (
        <Reveal>
          <SectionTitle theme={theme} eyebrow="A few memories" title={data.loveStory?.trim() ? labels.storyTitle ?? "Our Story" : labels.galleryTitle ?? "Our Moments"} />
          {data.loveStory?.trim() && <p className={`text-center max-w-md mx-auto leading-relaxed mb-6 ${theme.text}`}>{data.loveStory.trim()}</p>}
          {gallery.length > 0 &&
            (theme.gallery === "slider" ? (
              <GallerySlider photos={gallery} theme={theme} />
            ) : (
              <div className={`grid gap-3 ${gallery.length === 1 ? "grid-cols-1 max-w-xs mx-auto" : gallery.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {gallery.map((src, i) => (
                  <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Moment ${i + 1}`} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                ))}
              </div>
            ))}
        </Reveal>
      )}

      {/* Events */}
      <Reveal>
        <SectionTitle theme={theme} eyebrow="The celebrations" title={labels.eventsTitle ?? "Schedule of Events"} />
        <div className="space-y-4 max-w-md mx-auto">
          {events.map((evt) => {
            const e = resolveEvent(evt, data, events.length);
            return (
              <article key={evt.id} className={`${theme.card} p-5 text-center`}>
                <h3 className={`${theme.heading} text-2xl`}>{evt.eventName}</h3>
                {e.date && (
                  <p className={`mt-1 text-sm ${theme.accent}`}>
                    {weekdayName(e.date)}, {e.date.getDate()} {monthName(e.date)} {e.date.getFullYear()}
                  </p>
                )}
                {e.time && <p className={`text-sm ${theme.muted}`}>{e.time}</p>}
                {e.venue && (
                  <p className={`mt-2 text-sm ${theme.text}`}>
                    <span className="font-semibold">{e.venue}</span>
                    {e.address && <span className={`block ${theme.muted}`}>{e.address}</span>}
                  </p>
                )}
                {evt.description?.trim() && <p className={`mt-2 text-sm italic ${theme.muted}`}>{evt.description.trim()}</p>}
                {(e.mapsUrl || e.calendarUrl) && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {e.mapsUrl && (
                      <a href={e.mapsUrl} target="_blank" rel="noopener noreferrer" className={theme.button}>
                        View Location
                      </a>
                    )}
                    {e.calendarUrl && (
                      <a href={e.calendarUrl} target="_blank" rel="noopener noreferrer" className={theme.ghostButton}>
                        Add to Calendar
                      </a>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Reveal>

      {/* Venue */}
      {venueName && (
        <Reveal>
          <SectionTitle theme={theme} eyebrow="Find your way" title={labels.venueTitle ?? "The Venue"} />
          <div className={`${theme.card} p-6 text-center max-w-md mx-auto`}>
            <p className={`${theme.heading} text-2xl`}>{venueName}</p>
            {venueAddress && <p className={`mt-1 text-sm ${theme.muted}`}>{venueAddress}</p>}
            {(mainMaps || venueAddress) && (
              <a
                href={mainMaps || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName}, ${venueAddress}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-block mt-5 ${theme.button}`}
              >
                Get Directions
              </a>
            )}
          </div>
        </Reveal>
      )}

      {/* Closing */}
      <Reveal>
        <div className={`text-center pt-10 border-t ${theme.divider}`}>
          <p className={`text-[10px] uppercase tracking-[0.3em] ${theme.accent}`}>{labels.closingLine ?? "With love and gratitude"}</p>
          <p className={`${theme.heading} text-4xl mt-2`}>
            {groom} &amp; {bride}
          </p>
          {(data.contactDetails?.trim() || data.instagramLink?.trim()) && (
            <div className={`mt-4 flex flex-wrap justify-center gap-3 text-xs ${theme.muted}`}>
              {data.contactDetails?.trim() && <span>{data.contactDetails.trim()}</span>}
              {data.instagramLink?.trim() && (
                <a href={data.instagramLink} target="_blank" rel="noopener noreferrer" className="underline">
                  Follow our story
                </a>
              )}
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
