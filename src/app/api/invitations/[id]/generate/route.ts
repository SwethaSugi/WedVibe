import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createPaymentOrder } from "@/lib/providers/payment";
import { InvitationData } from "@/lib/invitation-types";

function validate(data: InvitationData): string | null {
  if (!data.groomName?.trim()) return "Groom name is required.";
  if (!data.brideName?.trim()) return "Bride name is required.";
  if (!data.weddingDate) return "Please enter the wedding date.";
  if (!data.venueName?.trim()) return "Wedding venue is required.";
  return null;
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id }, include: { template: true } });
  if (!invitation || invitation.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!["DRAFT", "PAYMENT_PENDING"].includes(invitation.status)) {
    return NextResponse.json({ error: "This invitation has already been generated." }, { status: 400 });
  }

  const data: InvitationData = JSON.parse(invitation.invitationData);
  const validationError = validate(data);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  // Reuse an unpaid order for this invitation (e.g. the couple went back to the editor)
  // instead of creating a new one on every click.
  const openOrder = await prisma.payment.findFirst({
    where: { invitationId: invitation.id, status: "CREATED", amount: invitation.template.price },
    orderBy: { createdAt: "desc" },
  });
  if (openOrder) {
    return NextResponse.json({ orderId: openOrder.orderId });
  }

  let order;
  try {
    order = await createPaymentOrder(invitation.template.price, invitation.template.currency, invitation.invitationCode);
  } catch {
    return NextResponse.json({ error: "Unable to start payment. Please try again." }, { status: 502 });
  }

  await prisma.payment.create({
    data: {
      userId: session.userId,
      invitationId: invitation.id,
      templateId: invitation.template.id,
      gateway: order.gateway,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      status: "CREATED",
    },
  });

  await prisma.invitation.update({ where: { id }, data: { status: "PAYMENT_PENDING" } });

  return NextResponse.json({ orderId: order.orderId });
}
