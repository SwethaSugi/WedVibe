import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  // Drafts and unpaid invitations are the couple's work-in-progress; admins only manage
  // generated ones. INACTIVE stays listed so a deactivated invitation can be reactivated.
  const invitations = await prisma.invitation.findMany({
    where: { status: { in: ["ACTIVE", "PUBLISHED", "INACTIVE"] } },
    orderBy: { createdAt: "desc" },
    include: { user: true, template: true },
  });

  return NextResponse.json({
    invitations: invitations.map((inv) => {
      const data = JSON.parse(inv.invitationData);
      return {
        id: inv.id,
        invitationCode: inv.invitationCode,
        slug: inv.slug,
        userMobile: inv.user.mobile,
        groomName: data.groomName,
        brideName: data.brideName,
        templateName: inv.template.name,
        status: inv.status,
        createdAt: inv.createdAt,
      };
    }),
  });
}
