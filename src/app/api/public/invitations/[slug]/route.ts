import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { slug }, include: { template: true } });

  if (!invitation || !["ACTIVE", "PUBLISHED"].includes(invitation.status)) {
    return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  }

  await prisma.invitation.update({ where: { id: invitation.id }, data: { views: { increment: 1 } } });

  return NextResponse.json({
    data: JSON.parse(invitation.invitationData),
    componentKey: invitation.template.componentKey,
    templateName: invitation.template.name,
  });
}
