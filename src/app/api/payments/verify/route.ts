import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { verifyPayment } from "@/lib/providers/payment";
import { activatePaidOrder } from "@/lib/payment-activation";

const schema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string().optional(),
});

const linkResponse = (invitation: { invitationCode: string; slug: string }) =>
  NextResponse.json({
    success: true,
    invitationCode: invitation.invitationCode,
    slug: invitation.slug,
    publicUrl: `/invite/${invitation.slug}`,
  });

// Called by the checkout right after the customer pays. The Razorpay webhook
// (/api/payments/webhook) is the backup for when this call never arrives — e.g. the customer
// closed the tab — and both go through activatePaidOrder, so the invitation activates once.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { orderId: parsed.data.orderId },
    include: { invitation: true },
  });
  if (!payment || payment.userId !== session.userId) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }
  // The webhook may have got here first (DUPLICATE = paid again for an already-live invitation).
  if ((payment.status === "SUCCESS" || payment.status === "DUPLICATE") && payment.invitation) {
    return linkResponse(payment.invitation);
  }
  // FAILED is allowed: a customer can retry inside the same Razorpay checkout after a failed
  // attempt (which the webhook records as FAILED), and the signature check below still guards it.
  if (payment.status !== "CREATED" && payment.status !== "FAILED") {
    return NextResponse.json({ error: "This payment can no longer be completed. Please start a new payment." }, { status: 400 });
  }

  let isValid: boolean;
  try {
    isValid = verifyPayment(parsed.data);
  } catch {
    isValid = false;
  }

  if (!isValid) {
    // Conditional, so a webhook that confirmed the payment meanwhile is never overwritten.
    await prisma.payment.updateMany({ where: { id: payment.id, status: "CREATED" }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  const result = await activatePaidOrder(parsed.data.orderId, parsed.data.paymentId);
  if (result.outcome === "missing-invitation") {
    return NextResponse.json({ error: "Invitation not found for this payment." }, { status: 404 });
  }
  return linkResponse(result.invitation);
}
