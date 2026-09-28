export interface InvitationEvent {
  id: string;
  eventName: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  description?: string;
}

export interface InvitationData {
  groomName: string;
  brideName: string;
  groomFatherName?: string;
  groomMotherName?: string;
  brideFatherName?: string;
  brideMotherName?: string;
  weddingDate: string; // yyyy-mm-dd
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl?: string;
  welcomeMessage: string;
  loveStory?: string;
  quote?: string;
  contactDetails?: string;
  instagramLink?: string;
  groomImage?: string;
  brideImage?: string;
  coupleImage?: string;
  galleryImages?: string[];
  events: InvitationEvent[];
  music?: InvitationMusic;
}

/** Background song: one from the WedVibe library, or the couple's own upload. */
export interface InvitationMusic {
  url: string; // always a /uploads/music/… file on this site
  title: string;
  source: "library" | "upload";
}

const MUSIC_URL = /^\/uploads\/music\/[A-Za-z0-9_-]+\.(mp3|m4a)$/;

/** Keeps only a well-formed song stored on this site; anything else means "no music". */
export function sanitizeMusic(value: unknown): InvitationMusic | undefined {
  if (!value || typeof value !== "object") return undefined;
  const m = value as Record<string, unknown>;
  if (typeof m.url !== "string" || !MUSIC_URL.test(m.url)) return undefined;
  const title = typeof m.title === "string" && m.title.trim() ? m.title.trim().slice(0, 80) : "Our song";
  return { url: m.url, title, source: m.source === "library" ? "library" : "upload" };
}

export const DEFAULT_INVITATION_DATA: InvitationData = {
  groomName: "",
  brideName: "",
  weddingDate: "",
  weddingTime: "",
  venueName: "",
  venueAddress: "",
  googleMapsUrl: "",
  welcomeMessage: "We warmly invite you to celebrate our special day with us.",
  // Event names only — times, dates and venues are left for the couple to fill in, so
  // nothing made-up ever reaches a live invitation.
  events: [
    { id: "evt-1", eventName: "Wedding" },
    { id: "evt-2", eventName: "Reception" },
  ],
};

export const SUPPORTED_FIELDS = [
  "groomName",
  "brideName",
  "groomFatherName",
  "groomMotherName",
  "brideFatherName",
  "brideMotherName",
  "weddingDate",
  "weddingTime",
  "venueName",
  "venueAddress",
  "googleMapsUrl",
  "welcomeMessage",
  "loveStory",
  "quote",
  "contactDetails",
  "instagramLink",
  "groomImage",
  "brideImage",
  "coupleImage",
  "galleryImages",
  "events",
] as const;
