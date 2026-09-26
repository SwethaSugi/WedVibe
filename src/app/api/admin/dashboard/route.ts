import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const [totalUsers, totalInvitations, activeInvitations, totalTemplates, payments] = await Promise.all([
    prisma.user.count(),
    // Matches the admin Invitations list: generated invitations only, no drafts/unpaid.
    prisma.invitation.count({ where: { status: { in: ["ACTIVE", "PUBLISHED", "INACTIVE"] } } }),
    prisma.invitation.count({ where: { status: "ACTIVE" } }),
    prisma.template.count({ where: { status: "ACTIVE" } }),
    prisma.payment.findMany(),
  ]);

  const successfulPayments = payments.filter((p) => p.status === "SUCCESS");
  const failedPayments = payments.filter((p) => p.status === "FAILED");
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

  return NextResponse.json({
    totalUsers,
    totalInvitations,
    activeInvitations,
    totalTemplates,
    totalRevenue,
    successfulPayments: successfulPayments.length,
    failedPayments: failedPayments.length,
  });
}
