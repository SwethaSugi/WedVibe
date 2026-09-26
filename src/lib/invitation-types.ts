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
