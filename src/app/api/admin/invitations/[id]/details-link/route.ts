import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const schema = z.object({ action: z.enum(["create", "revoke"]) });

// Creates (or replaces) the private no-login link a customer can use to type their own details,
// or switches it off. Replacing a link makes the old one stop working.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const inv = await prisma.invitation.findUnique({ where: { id }, select: { id: true } });
  if (!inv) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });

  const detailsToken = parsed.data.action === "create" ? randomBytes(24).toString("base64url") : null;
  await prisma.invitation.update({ where: { id }, data: { detailsToken, ...(detailsToken ? { detailsSubmittedAt: null } : {}) } });
  return NextResponse.json({ detailsToken });
}
