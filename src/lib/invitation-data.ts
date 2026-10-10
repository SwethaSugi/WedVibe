// Server-side rules for invitation details, shared by every place that saves them: the couple's
// own editor, the admin invitation builder and the customer details-form link.

import { sanitizeMusic, type InvitationData } from "@/lib/invitation-types";
import { blobHost } from "@/lib/providers/storage";

export const MAX_GALLERY_IMAGES = 3;

/** Cleans details before saving: caps the gallery and keeps only a song stored by this site. */
export function cleanInvitationData(raw: Record<string, unknown>): Record<string, unknown> {
  const data = { ...raw };
  if (Array.isArray(data.galleryImages)) data.galleryImages = data.galleryImages.slice(0, MAX_GALLERY_IMAGES);
  const music = sanitizeMusic(data.music, blobHost());
  if (music) data.music = music;
  else delete data.music;
  return data;
}

/** What must be filled in before an invitation can go live; returns the first problem, or null. */
export function missingForPublish(data: InvitationData): string | null {
  if (!data.groomName?.trim()) return "Groom name is required.";
  if (!data.brideName?.trim()) return "Bride name is required.";
  if (!data.weddingDate) return "Please enter the wedding date.";
  if (!data.venueName?.trim()) return "Wedding venue is required.";
  return null;
}
