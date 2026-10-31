// Server-side rules for invitation details, shared by every place that saves them: the couple's
// own editor, the admin invitation builder and the customer details-form link.

import { sanitizeMusic, type InvitationData } from "@/lib/invitation-types";
import { blobHost } from "@/lib/providers/storage";
import { fieldLabels, WEDDING_LABELS } from "@/lib/template-fields";

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
export function missingForPublish(data: InvitationData, componentKey = ""): string | null {
  const labels = fieldLabels(componentKey);
  if (!data.groomName?.trim()) return `${labels.groomName} is required.`;
  if (!data.brideName?.trim()) return `${labels.brideName} is required.`;
  if (!data.weddingDate) return `Please enter the ${labels.date.toLowerCase()}.`;
  if (!data.venueName?.trim()) return "Venue name is required.";
  return null;
}

const slugPart = (s?: string) =>
  (s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);

/**
 * The readable start of an invitation's public link: "arjun-weds-divya" for a wedding, or just
 * the name for other occasions (e.g. "baby-aarav"), where groomName holds the person celebrated.
 */
export function invitationSlugBase(data: InvitationData, componentKey: string, joiner = "-weds-"): string {
  if (fieldLabels(componentKey) !== WEDDING_LABELS) return slugPart(data.groomName) || "celebration";
  return `${slugPart(data.groomName) || "groom"}${joiner}${slugPart(data.brideName) || "bride"}`;
}
