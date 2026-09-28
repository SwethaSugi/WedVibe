import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

// Edit a song's details or hide/show it. Songs are never deleted: couples who already picked one
// keep hearing it on their invitation; a hidden song just isn't offered to new couples.
const updateSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  mood: z.string().trim().min(1).max(40).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid song details." }, { status: 400 });

  const exists = await prisma.musicTrack.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Song not found." }, { status: 404 });

  const track = await prisma.musicTrack.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ track });
}
