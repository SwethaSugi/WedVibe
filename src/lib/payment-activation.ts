// Turns a confirmed payment into a live invitation. Shared by the checkout's verify call and the
// Razorpay webhook so an invitation is activated exactly once, whichever of the two arrives first.

import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { InvitationData } from "@/lib/invitation-types";

// Invitation statuses that mean "not yet published" — only these may be activated.
const UNPUBLISHED = ["DRAFT", "PAYMENT_PENDING"];
const PUBLISHED = ["ACTIVE", "PUBLISHED", "INACTIVE"];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type ActivationResult =
  | { outcome: "activated" | "already-active"; invitation: { invitationCode: string; slug: string } }
  // Paid, but the invitation was already live through another order: the money should be refunded.
  | { outcome: "duplicate"; invitation: { invitationCode: string; slug: string } }
  | { outcome: "missing-invitation" };

/**
 * Marks the payment SUCCESS and publishes its invitation. Safe to call repeatedly and
 * concurrently: the status changes are conditional updates, so only one caller wins each step.
 * Works even if the order was earlier marked FAILED — Razorpay allows retries within one order,
 * so a "failed" order can still end up paid.
 */
export async function activatePaidOrder(orderId: string, paymentId: string): Promise<ActivationResult> {
  const payment = await prisma.payment.findUnique({ where: { orderId }, include: { invitation: true } });
  if (!payment || !payment.invitationId || !payment.invitation) return { outcome: "missing-invitation" };

  const invitation = payment.invitation;

  // Already live through a *different* order? Then this payment is a duplicate.
  if (PUBLISHED.includes(invitation.status) && payment.status !== "SUCCESS") {
    await prisma.payment.updateMany({
      where: { id: payment.id, status: { notIn: ["SUCCESS", "DUPLICATE", "REFUNDED"] } },
      data: { status: "DUPLICATE", paymentId },
    });
    return { outcome: "duplicate", invitation: { invitationCode: invitation.invitationCode, slug: invitation.slug } };
  }

  // Record the payment once (no-op if already SUCCESS).
  await prisma.payment.updateMany({
    where: { id: payment.id, status: { notIn: ["SUCCESS", "REFUNDED"] } },
    data: { status: "SUCCESS", paymentId },
  });

  // Publish once: the status condition makes this atomic, so a racing call can't re-slug it.
  const data: InvitationData = JSON.parse(invitation.invitationData);
  const slug = `${slugify(`${data.groomName}-${data.brideName}`) || "invitation"}-${nanoid(6).toUpperCase()}`;
  const { count } = await prisma.invitation.updateMany({
    where: { id: invitation.id, status: { in: UNPUBLISHED } },
    data: { status: "ACTIVE", slug, activatedAt: new Date() },
  });

  const current = await prisma.invitation.findUniqueOrThrow({ where: { id: invitation.id } });
  const ref = { invitationCode: current.invitationCode, slug: current.slug };
  if (count === 1) return { outcome: "activated", invitation: ref };

  // Lost the publish race. If a *different* order for this invitation succeeded, this payment
  // is a duplicate (two orders paid at nearly the same moment) — flag it for a refund.
  const otherSuccess = await prisma.payment.findFirst({
    where: { invitationId: invitation.id, status: "SUCCESS", id: { not: payment.id } },
  });
  if (otherSuccess) {
    await prisma.payment.updateMany({ where: { id: payment.id, status: "SUCCESS" }, data: { status: "DUPLICATE" } });
    return { outcome: "duplicate", invitation: ref };
  }
  return { outcome: "already-active", invitation: ref };
}
