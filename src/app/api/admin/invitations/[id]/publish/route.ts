import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { missingForPublish } from "@/lib/invitation-data";
import type { InvitationData } from "@/lib/invitation-types";

const slugPart = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);

// Puts an invitation live once its key details are filled in. The first time, it also gets its
// shareable link, e.g. /invite/arjun-weds-divya-k3x9; that link never changes afterwards.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });

  const data: InvitationData = JSON.parse(inv.invitationData);
  const missing = missingForPublish(data);
  if (missing) return NextResponse.json({ error: missing }, { status: 400 });

  const firstPublish = !inv.activatedAt;
  const names = `${slugPart(data.groomName) || "groom"}-weds-${slugPart(data.brideName) || "bride"}`;
  const updated = await prisma.invitation.update({
    where: { id },
    data: {
      status: "ACTIVE",
      ...(firstPublish ? { activatedAt: new Date(), slug: `${names}-${nanoid(4).toLowerCase().replace(/[^a-z0-9]/g, "x")}` } : {}),
    },
  });
  return NextResponse.json({ invitation: { id: updated.id, status: updated.status, slug: updated.slug } });
}
