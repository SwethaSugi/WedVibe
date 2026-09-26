import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCheckoutConfig } from "@/lib/providers/payment";
import { InvitationData } from "@/lib/invitation-types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  const payment = await prisma.payment.findUnique({
    where: { orderId },
    include: { invitation: { include: { template: true } }, user: true },
  });
  if (!payment || payment.userId !== session.userId || !payment.invitation) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }

  const data: InvitationData = JSON.parse(payment.invitation.invitationData);
  // A DUPLICATE payment (paid again for an already-live invitation) is shown to the customer as
  // a success with their live link; admins see it as DUPLICATE so it can be refunded.
  const status = payment.status === "DUPLICATE" ? "SUCCESS" : payment.status;

  return NextResponse.json({
    order: {
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      status,
    },
    invitation: {
      id: payment.invitation.id,
      invitationCode: payment.invitation.invitationCode,
      status: payment.invitation.status,
      groomName: data.groomName,
      brideName: data.brideName,
      weddingDate: data.weddingDate,
      weddingTime: data.weddingTime,
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      templateName: payment.invitation.template.name,
      publicUrl: status === "SUCCESS" ? `/invite/${payment.invitation.slug}` : null,
    },
    customer: { name: payment.user.name, mobile: payment.user.mobile },
    checkout: getCheckoutConfig(),
  });
}
