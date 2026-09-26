import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const templates = await prisma.template.findMany({
    where: {
      status: "ACTIVE",
      ...(category ? { category } : {}),
    },
    // Newest designs first, so recently added templates lead the marketplace.
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    templates: templates.map((t) => ({ ...t, supportedFields: JSON.parse(t.supportedFields) })),
  });
}
