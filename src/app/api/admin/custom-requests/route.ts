import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const requests = await prisma.customRequest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ requests });
}
