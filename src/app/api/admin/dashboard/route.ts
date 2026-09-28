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

  // Successful revenue per calendar month in Indian time, keyed "YYYY-MM" (e.g. "2026-09").
  const monthKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" });
  const monthly: Record<string, { revenue: number; count: number }> = {};
  for (const p of successfulPayments) {
    const key = monthKey.format(p.createdAt);
    monthly[key] ??= { revenue: 0, count: 0 };
    monthly[key].revenue += p.amount;
    monthly[key].count += 1;
  }

  return NextResponse.json({
    totalUsers,
    totalInvitations,
    activeInvitations,
    totalTemplates,
    totalRevenue,
    monthly,
    successfulPayments: successfulPayments.length,
    failedPayments: failedPayments.length,
  });
}
