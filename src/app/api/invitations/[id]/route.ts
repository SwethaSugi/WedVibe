import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getEditInfo } from "@/lib/edit-policy";

const updateSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id }, include: { template: true } });
  if (!invitation || invitation.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    invitation: {
      id: invitation.id,
      slug: invitation.slug,
      status: invitation.status,
      data: JSON.parse(invitation.invitationData),
      editInfo: getEditInfo(invitation),
      template: {
        id: invitation.template.id,
        name: invitation.template.name,
        componentKey: invitation.template.componentKey,
        price: invitation.template.price,
        currency: invitation.template.currency,
      },
    },
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation || invitation.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!["DRAFT", "PAYMENT_PENDING", "PAID", "PUBLISHED", "ACTIVE"].includes(invitation.status)) {
    return NextResponse.json({ error: "This invitation can no longer be edited." }, { status: 400 });
  }
  const editInfo = getEditInfo(invitation);
  if (!editInfo.canEdit) {
    return NextResponse.json({ error: editInfo.reason, editInfo }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid invitation data." }, { status: 400 });
  }

  const nextData = { ...parsed.data.data };
  if (Array.isArray(nextData.galleryImages)) {
    nextData.galleryImages = nextData.galleryImages.slice(0, 3);
  }

  const updated = await prisma.invitation.update({
    where: { id },
    data: {
      invitationData: JSON.stringify(nextData),
      ...(editInfo.isLive ? { editCount: { increment: 1 } } : {}),
    },
  });

  return NextResponse.json({ success: true, editInfo: getEditInfo(updated) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: { _count: { select: { payments: true } } },
  });
  if (!invitation || invitation.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Only unpublished, never-paid drafts can be removed; anything past that point has a
  // public link or payment record that must be kept.
  if (invitation.status !== "DRAFT" || invitation._count.payments > 0) {
    return NextResponse.json({ error: "Only draft invitations can be removed." }, { status: 400 });
  }

  await prisma.invitation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
