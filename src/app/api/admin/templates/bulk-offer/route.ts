import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

// Applies one discount percentage to every template at once: each template's offer price is set
// from its own regular price. `percent: null` removes all offers. Individual offers set before are
// replaced; they can still be adjusted one by one afterwards.
const schema = z.object({
  percent: z.number().int().min(1).max(90).nullable(),
});

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a whole percentage between 1 and 90." }, { status: 400 });
  }
  const { percent } = parsed.data;

  if (percent === null) {
    const { count } = await prisma.template.updateMany({ where: { offerPrice: { not: null } }, data: { offerPrice: null } });
    return NextResponse.json({ updated: count });
  }

  const templates = await prisma.template.findMany({ select: { id: true, price: true } });
  const updates = templates.map((t) => {
    const offer = Math.round(t.price * (1 - percent / 100));
    // Free (₹0) or not-actually-discounted templates keep no offer.
    const offerPrice = offer >= 1 && offer < t.price ? offer : null;
    return prisma.template.update({ where: { id: t.id }, data: { offerPrice } });
  });
  await prisma.$transaction(updates);

  return NextResponse.json({ updated: updates.length });
}
