import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { invitations: true, payments: true } } },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      mobile: u.mobile,
      status: u.status,
      createdAt: u.createdAt,
      totalInvitations: u._count.invitations,
      totalPayments: u._count.payments,
    })),
  });
}
