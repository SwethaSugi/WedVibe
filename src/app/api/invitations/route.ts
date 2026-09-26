import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { DEFAULT_INVITATION_DATA } from "@/lib/invitation-types";
import { getEditInfo } from "@/lib/edit-policy";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const createSchema = z.object({
  templateId: z.string(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invitations = await prisma.invitation.findMany({
    where: { userId: session.userId },
    include: { template: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    invitations: invitations.map((inv) => ({
      id: inv.id,
      slug: inv.slug,
      status: inv.status,
      templateName: inv.template.name,
      templatePreviewImage: inv.template.previewImage,
      price: inv.template.price,
      currency: inv.template.currency,
      views: inv.views,
      editInfo: getEditInfo(inv),
      data: JSON.parse(inv.invitationData),
      updatedAt: inv.updatedAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please select a template." }, { status: 400 });
  }

  const template = await prisma.template.findUnique({ where: { id: parsed.data.templateId } });
  if (!template || template.status !== "ACTIVE") {
    return NextResponse.json({ error: "Selected template is unavailable." }, { status: 404 });
  }

  const code = `INV-${nanoid(8).toUpperCase()}`;
  const invitation = await prisma.invitation.create({
    data: {
      invitationCode: code,
      slug: `${slugify(DEFAULT_INVITATION_DATA.groomName + "-" + DEFAULT_INVITATION_DATA.brideName)}-${nanoid(6)}`,
      userId: session.userId,
      templateId: template.id,
      invitationData: JSON.stringify(DEFAULT_INVITATION_DATA),
      status: "DRAFT",
    },
  });

  return NextResponse.json({ invitation: { id: invitation.id, slug: invitation.slug } });
}
