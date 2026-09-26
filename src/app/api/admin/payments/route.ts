import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const status = req.nextUrl.searchParams.get("status");

  const payments = await prisma.payment.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: true, invitation: true },
  });

  return NextResponse.json({
    payments: payments.map((p) => ({
      id: p.id,
      orderId: p.orderId,
      paymentId: p.paymentId,
      userMobile: p.user.mobile,
      invitationCode: p.invitation?.invitationCode ?? null,
      amount: p.amount,
      currency: p.currency,
      gateway: p.gateway,
      status: p.status,
      createdAt: p.createdAt,
    })),
  });
}
