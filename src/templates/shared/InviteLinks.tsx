import type { ReactNode } from "react";
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

/**
 * Venue buttons for templates with their own button style: `render` draws one button in the
 * template's look; it's called for directions and, when there's a date, for "Add to Calendar".
 */
export function VenueLinks({ data, render }: { data: LinkData; render: (href: string, isCalendar: boolean) => ReactNode }) {
  const { mapsUrl, calendarUrl } = venueLinks(data);
  if (!mapsUrl && !calendarUrl) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      {mapsUrl && render(mapsUrl, false)}
      {calendarUrl && render(calendarUrl, true)}
    </span>
  );
}

/** Small "Location" and "Add to Calendar" links under one event, in the template's accent colour. */
export function EventLinks({
  evt,
  data,
  count,
  className = "",
}: {
  evt: { eventName: string; eventDate?: string; eventTime?: string; venue?: string };
  data: LinkData;
  count: number;
  className?: string;
}) {
  const { mapsUrl, calendarUrl } = resolveEvent(evt, data, count);
  if (!mapsUrl && !calendarUrl) return null;
  const link = "inline-flex items-center gap-1 underline underline-offset-4 decoration-current/40 hover:decoration-current transition-colors";
  return (
    <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold uppercase tracking-wider ${className}`}>
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={link}>
          <span aria-hidden>📍</span> Location
        </a>
      )}
      {calendarUrl && (
        <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={link}>
          <span aria-hidden>📅</span> Add to Calendar
        </a>
      )}
    </div>
  );
}
