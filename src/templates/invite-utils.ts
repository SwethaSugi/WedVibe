// Shared date/time/link helpers for the interactive (full-page) templates.

export function parseDate(dateStr?: string): Date | null {
  if (!dateStr?.trim()) return null;
  const p = dateStr.trim().split("-");
  const d = p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]) : new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// Accepts "6:00 AM", "06:30 pm", "18:00", "9 AM".
export function parseTime(t?: string): { h: number; m: number } | null {
  const match = t?.trim().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*([AaPp][Mm])?/);
  if (!match) return null;
  let h = +match[1];
  const m = match[2] ? +match[2] : 0;
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  if (h > 23 || m > 59) return null;
  return { h, m };
}

export const pad = (n: number, len = 2) => String(n).padStart(len, "0");

export const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const weekdayName = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "long" });
export const monthName = (d: Date) => d.toLocaleDateString("en-IN", { month: "long" });

// Wedding date + time as one moment (time defaults to midnight when missing or unparseable).
export function weddingMoment(date?: string, time?: string): Date | null {
  const d = parseDate(date);
  if (!d) return null;
  const t = parseTime(time);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), t?.h ?? 0, t?.m ?? 0);
}

export function googleCalendarUrl(title: string, date: Date | null, time: string | undefined, location: string, details: string) {
  if (!date) return null;
  const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const t = parseTime(time);
  let dates: string;
  if (t) {
    const start = new Date(date);
    start.setHours(t.h, t.m, 0, 0);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const stamp = (d: Date) => `${ymd(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    dates = `${stamp(start)}/${stamp(end)}`;
  } else {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    dates = `${ymd(date)}/${ymd(next)}`;
  }
  const params = new URLSearchParams({ action: "TEMPLATE", text: title, dates, details, location, ctz: "Asia/Kolkata" });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const mapsSearchUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

interface EventLike {
  eventName: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  description?: string;
}
interface WeddingLike {
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  weddingTime?: string;
  venueName?: string;
  venueAddress?: string;
  googleMapsUrl?: string;
  welcomeMessage?: string;
}

/**
 * Fills in an event's display details. The main ceremony (the only event, or one named like a
 * wedding/engagement/nikah) falls back to the wedding's own date, time and venue; other events
 * show only what the couple entered. Includes Google Maps and Google Calendar links.
 */
export function resolveEvent(evt: EventLike, data: WeddingLike, eventCount: number) {
  const venueName = data.venueName?.trim() || "";
  const isMain = eventCount === 1 || /wedding|marriage|engagement|muhurtham|nikah|anand karaj/i.test(evt.eventName);
  const date = parseDate(evt.eventDate) ?? (isMain ? parseDate(data.weddingDate) : null);
  const time = evt.eventTime?.trim() || (isMain ? data.weddingTime?.trim() || "" : "");
  const venue = evt.venue?.trim() || (isMain ? venueName : "");
  const address = venue && venue === venueName ? data.venueAddress?.trim() || "" : "";
  const location = [venue, address].filter(Boolean).join(", ");
  const mapsUrl = venue === venueName && data.googleMapsUrl ? data.googleMapsUrl : location ? mapsSearchUrl(location) : null;
  const couple = [data.groomName?.trim(), data.brideName?.trim()].filter(Boolean).join(" & ");
  const calendarUrl = googleCalendarUrl(`${evt.eventName}${couple ? ` — ${couple}` : ""}`, date, time, location, data.welcomeMessage ?? "");
  return { date, time, venue, address, mapsUrl, calendarUrl };
}
