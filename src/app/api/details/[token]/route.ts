import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { cleanInvitationData } from "@/lib/invitation-data";
import { DETAILS_LINK_EDITABLE, invitationForDetailsToken } from "@/lib/upload-auth";

// The customer's private details-form link (/details/<token>): no login, only this invitation,
// and only while it hasn't been published. Exposes the details and template, nothing else.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await invitationForDetailsToken(token);
  if (!inv) return NextResponse.json({ error: "This link is not valid. Please ask us for a new one." }, { status: 404 });

  return NextResponse.json({
    invitation: {
      data: JSON.parse(inv.invitationData),
      template: { name: inv.template.name, componentKey: inv.template.componentKey },
      editable: DETAILS_LINK_EDITABLE.includes(inv.status),
      submittedAt: inv.detailsSubmittedAt,
    },
  });
}

const schema = z.object({ data: z.record(z.string(), z.unknown()), submit: z.boolean().optional() });

export async function PUT(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await invitationForDetailsToken(token);
  if (!inv) return NextResponse.json({ error: "This link is not valid. Please ask us for a new one." }, { status: 404 });
  if (!DETAILS_LINK_EDITABLE.includes(inv.status)) {
    return NextResponse.json({ error: "Your invitation has already been published. Message us on WhatsApp for any changes." }, { status: 400 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid details." }, { status: 400 });

  await prisma.invitation.update({
    where: { id: inv.id },
    data: {
      invitationData: JSON.stringify(cleanInvitationData(parsed.data.data)),
      ...(parsed.data.submit ? { detailsSubmittedAt: new Date() } : {}),
    },
  });
  return NextResponse.json({ success: true });
}
