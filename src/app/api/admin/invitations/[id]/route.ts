import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { cleanInvitationData } from "@/lib/invitation-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const inv = await prisma.invitation.findUnique({ where: { id }, include: { template: true, user: true } });
  if (!inv) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });

  return NextResponse.json({
    invitation: {
      id: inv.id,
      slug: inv.slug,
      status: inv.status,
      invitationCode: inv.invitationCode,
      data: JSON.parse(inv.invitationData),
      activatedAt: inv.activatedAt,
      detailsToken: inv.detailsToken,
      detailsSubmittedAt: inv.detailsSubmittedAt,
      customer: { name: inv.user.name, mobile: inv.user.mobile },
      template: { id: inv.template.id, name: inv.template.name, componentKey: inv.template.componentKey },
    },
  });
}

const updateSchema = z.union([
  z.object({ status: z.enum(["ACTIVE", "INACTIVE"]) }),
  z.object({ data: z.record(z.string(), z.unknown()) }),
]);

// Saves details from the admin builder (no edit limits for the team; a live invitation updates
// right away), or switches a published invitation on/off.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update." }, { status: 400 });

  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });

  if ("status" in parsed.data) {
    // Drafts go live through Publish (which checks the details and sets the link), not here.
    if (!inv.activatedAt && !["ACTIVE", "PUBLISHED", "INACTIVE"].includes(inv.status)) {
      return NextResponse.json({ error: "Publish this invitation first." }, { status: 400 });
    }
    const updated = await prisma.invitation.update({ where: { id }, data: { status: parsed.data.status } });
    return NextResponse.json({ invitation: { id: updated.id, status: updated.status } });
  }

  await prisma.invitation.update({ where: { id }, data: { invitationData: JSON.stringify(cleanInvitationData(parsed.data.data)) } });
  return NextResponse.json({ success: true });
}

// Removes an unpublished draft (e.g. a cancelled order). Published invitations are kept: their
// link may already have been shared — deactivate those instead.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const inv = await prisma.invitation.findUnique({ where: { id }, include: { _count: { select: { payments: true } } } });
  if (!inv) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  if (inv.activatedAt || !["DRAFT", "PAYMENT_PENDING"].includes(inv.status) || inv._count.payments > 0) {
    return NextResponse.json({ error: "Only unpublished drafts can be deleted. Deactivate a published invitation instead." }, { status: 400 });
  }
  await prisma.invitation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
