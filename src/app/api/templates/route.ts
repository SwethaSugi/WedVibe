import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const templates = await prisma.template.findMany({
    where: {
      // Local development also lists DRAFT templates, so new designs can be checked before
      // they go live. Production (the live site) only ever shows ACTIVE ones.
      status: process.env.NODE_ENV === "production" ? "ACTIVE" : { in: ["ACTIVE", "DRAFT"] },
      ...(category ? { category } : {}),
    },
    // Newest designs first, so recently added templates lead the marketplace.
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    templates: templates.map((t) => ({ ...t, supportedFields: JSON.parse(t.supportedFields) })),
  });
}
