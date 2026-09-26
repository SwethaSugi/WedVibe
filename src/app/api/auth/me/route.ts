import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  return NextResponse.json({ user: user ? { id: user.id, mobile: user.mobile, name: user.name } : null });
}

const updateSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
});

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid name." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { name: parsed.data.name },
  });

  return NextResponse.json({ user: { id: user.id, mobile: user.mobile, name: user.name } });
}
