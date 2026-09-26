import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Records a failed or abandoned attempt reported by the checkout. The invitation stays
// unpublished (PAYMENT_PENDING) so the couple can retry with a fresh order.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  const payment = await prisma.payment.findUnique({ where: { orderId } });
  if (!payment || payment.userId !== session.userId) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }
  if (payment.status === "CREATED") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
  }
  return NextResponse.json({ success: true });
}
