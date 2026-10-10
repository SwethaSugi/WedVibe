import { getAdminSession, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UploadKind } from "@/lib/providers/storage";

/** Invitation statuses whose details can still be filled in through a customer details link. */
export const DETAILS_LINK_EDITABLE = ["DRAFT", "PAYMENT_PENDING"];

/** Finds the invitation behind a customer details link, if the link is valid and still open. */
export async function invitationForDetailsToken(token: unknown) {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  return prisma.invitation.findUnique({ where: { detailsToken: token }, include: { template: true } });
}

/**
 * Who may upload what:
 *  - photos and the couple's own song: a logged-in customer, an admin building an invitation,
 *    or a customer using a valid, still-open details link. Songs also need the rights box ticked.
 *  - songs for the shared music library: admins only.
 * Returns an error, or null when the upload is allowed.
 */
export async function uploadDenied(
  kind: UploadKind,
  rightsConfirmed: boolean,
  detailsToken?: unknown
): Promise<{ status: number; error: string } | null> {
  const admin = await getAdminSession();
  if (kind === "admin-music") return admin ? null : { status: 401, error: "Unauthorized" };

  let allowed = !!admin || !!(await getSession());
  if (!allowed && detailsToken) {
    const inv = await invitationForDetailsToken(detailsToken);
    allowed = !!inv && DETAILS_LINK_EDITABLE.includes(inv.status);
  }
  if (!allowed) return { status: 401, error: "Unauthorized" };
  if (kind === "music" && !rightsConfirmed) {
    return { status: 400, error: "Please confirm you have the right to use this song." };
  }
  return null;
}
