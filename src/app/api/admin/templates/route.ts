import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { SUPPORTED_FIELDS } from "@/lib/invitation-types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  price: z.number().int().nonnegative(),
  componentKey: z.string().min(1),
  previewImage: z.string().optional(),
});

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const templates = await prisma.template.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid template data." }, { status: 400 });
  }

  const template = await prisma.template.create({
    data: {
      ...parsed.data,
      slug: `${slugify(parsed.data.name)}`,
      currency: "INR",
      status: "DRAFT",
      supportedFields: JSON.stringify(SUPPORTED_FIELDS),
    },
  });

  return NextResponse.json({ template });
}
