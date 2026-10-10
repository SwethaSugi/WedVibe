import { googleCalendarUrl, mapsSearchUrl, parseDate, resolveEvent } from "../invite-utils";

type LinkData = {
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  weddingTime?: string;
  venueName?: string;
  venueAddress?: string;
  googleMapsUrl?: string;
  welcomeMessage?: string;
};

/** Directions to the wedding venue (the couple's own Maps link, or a Maps search) and a calendar link. */
export function venueLinks(data: LinkData) {
  const location = [data.venueName?.trim(), data.venueAddress?.trim()].filter(Boolean).join(", ");
  const mapsUrl = data.googleMapsUrl?.trim() || (location ? mapsSearchUrl(location) : null);
  const couple = [data.groomName?.trim(), data.brideName?.trim()].filter(Boolean).join(" & ");
  const calendarUrl = googleCalendarUrl(
    `Wedding${couple ? ` — ${couple}` : ""}`,
    parseDate(data.weddingDate),
    data.weddingTime,
    location,
    data.welcomeMessage ?? ""
  );
  return { mapsUrl, calendarUrl };
}

function PinIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function CalendarIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

/**
 * The venue's "Get Directions" + "Add to Calendar" pair, drawn as one consistent set: a solid
 * primary button and a matching outline button of the same size, in the template's colours.
 *  - variant "buttons" (default): pass `solid` and `outline` colour classes (+ optional `font`, `shape`).
 *  - variant "text": two understated text links for templates whose venue uses a plain link (`link`).
 */
export function VenueButtons({
  data,
  align = "center",
  variant = "buttons",
  solid = "",
  outline = "",
  link = "",
  font = "",
  shape = "rounded-full",
  label = "text-[11px] font-bold uppercase tracking-[0.14em]",
  className = "mt-5",
}: {
  data: LinkData;
  align?: "center" | "left";
  variant?: "buttons" | "text";
  solid?: string;
  outline?: string;
  link?: string;
  font?: string;
  shape?: string;
  label?: string;
  className?: string;
}) {
  const { mapsUrl, calendarUrl } = venueLinks(data);
  if (!mapsUrl && !calendarUrl) return null;
  const row = `flex flex-wrap items-center gap-2.5 ${align === "left" ? "justify-start" : "justify-center"} ${className}`;

  if (variant === "text") {
    const a = `inline-flex items-center gap-1.5 ${link}`;
    return (
      <div className={`${row} gap-x-5`}>
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={a}>
            <PinIcon /> Get Directions
          </a>
        )}
        {calendarUrl && (
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={a}>
            <CalendarIcon /> Add to Calendar
          </a>
        )}
      </div>
    );
  }

  // Both buttons share one fixed width, so they line up as an even pair (side by side where
  // there's room, neatly stacked on phones).
  const base = `inline-flex items-center justify-center gap-2 w-[13rem] max-w-full px-4 py-2.5 whitespace-nowrap ${shape} ${label} ${font} transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]`;
  return (
    <div className={row}>
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={`${base} border border-transparent ${solid}`}>
          <PinIcon /> Get Directions
        </a>
      )}
      {calendarUrl && (
        <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={`${base} border ${outline}`}>
          <CalendarIcon /> Add to Calendar
        </a>
      )}
    </div>
  );
}

/**
 * "Location" and "Add to Calendar" for one event: two small outline pills in the template's
 * accent colour (`className` sets the colour, e.g. "text-amber-300"). Follows the card's own
 * text alignment, so it sits neatly in both left-aligned and centred cards.
 */
export function EventLinks({
  evt,
  data,
  count,
  className = "",
  wrapperClassName = "",
}: {
  evt: { eventName: string; eventDate?: string; eventTime?: string; venue?: string };
  data: LinkData;
  count: number;
  className?: string;
  wrapperClassName?: string;
}) {
  const { mapsUrl, calendarUrl } = resolveEvent(evt, data, count);
  if (!mapsUrl && !calendarUrl) return null;
  // Inline pills flow like text, so they follow the card's own alignment (centred or left)
  // even when they wrap; the negative margin offsets the pills' own spacing.
  const pill =
    "inline-flex items-center gap-1 m-[3px] px-2.5 py-[3px] rounded-full border border-current/35 text-[10px] leading-4 font-semibold uppercase tracking-[0.06em] whitespace-nowrap hover:border-current/70 hover:bg-current/[0.06] transition-colors";
  return (
    <div className={`mt-2 -m-[3px] ${className} ${wrapperClassName}`}>
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={pill}>
          <PinIcon className="w-3 h-3" /> Location
        </a>
      )}
      {calendarUrl && (
        <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={pill}>
          <CalendarIcon className="w-3 h-3" /> Add to Calendar
        </a>
      )}
    </div>
  );
}
