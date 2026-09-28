import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  price: z.number().int().nonnegative().optional(),
  // null removes the offer.
  offerPrice: z.number().int().positive().nullable().optional(),
  previewImage: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template data." }, { status: 400 });
  }

  if (parsed.data.offerPrice != null) {
    const current = await prisma.template.findUnique({ where: { id }, select: { price: true } });
    if (!current) return NextResponse.json({ error: "Template not found." }, { status: 404 });
    if (parsed.data.offerPrice >= (parsed.data.price ?? current.price)) {
      return NextResponse.json({ error: "Offer price must be lower than the regular price." }, { status: 400 });
    }
  }

  const template = await prisma.template.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ template });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await prisma.template.update({ where: { id }, data: { status: "INACTIVE" } });
  return NextResponse.json({ success: true });
}
