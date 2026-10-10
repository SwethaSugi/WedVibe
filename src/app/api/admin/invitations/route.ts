import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { normalizeMobile } from "@/lib/phone";
import { DEFAULT_INVITATION_DATA } from "@/lib/invitation-types";
import { effectivePrice } from "@/lib/pricing";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  // Every invitation, including drafts the team is still building for a customer.
  const invitations = await prisma.invitation.findMany({
    orderBy: { updatedAt: "desc" },
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
        customerName: inv.user.name,
        groomName: data.groomName,
        brideName: data.brideName,
        templateName: inv.template.name,
        price: effectivePrice(inv.template),
        status: inv.status,
        hasDetailsLink: !!inv.detailsToken,
        detailsSubmittedAt: inv.detailsSubmittedAt,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
      };
    }),
  });
}

const createSchema = z.object({
  templateId: z.string().min(1),
  customerMobile: z.string().min(1),
  customerName: z.string().trim().max(80).optional(),
});

// Starts an invitation for a customer who ordered on WhatsApp. The customer is found by mobile
// number (or added), so the invitation is theirs if online accounts are switched on later.
export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a template and enter the customer's WhatsApp number." }, { status: 400 });
  const mobile = normalizeMobile(parsed.data.customerMobile);
  if (!mobile) return NextResponse.json({ error: "Please enter a valid WhatsApp number." }, { status: 400 });

  const template = await prisma.template.findUnique({ where: { id: parsed.data.templateId } });
  if (!template) return NextResponse.json({ error: "Template not found." }, { status: 404 });

  const name = parsed.data.customerName || null;
  const existing = await prisma.user.findUnique({ where: { mobile } });
  const user = existing
    ? !existing.name && name
      ? await prisma.user.update({ where: { id: existing.id }, data: { name } })
      : existing
    : await prisma.user.create({ data: { mobile, name } });

  const invitation = await prisma.invitation.create({
    data: {
      invitationCode: `INV-${nanoid(8).toUpperCase()}`,
      slug: `draft-${nanoid(10).toLowerCase()}`, // replaced by "<groom>-weds-<bride>-xxxx" when published
      userId: user.id,
      templateId: template.id,
      invitationData: JSON.stringify(DEFAULT_INVITATION_DATA),
      status: "DRAFT",
    },
  });
  return NextResponse.json({ invitation: { id: invitation.id } });
}
