import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, hashPin, validatePin } from "@/lib/auth";

const schema = z.object({ pin: z.string() });

// Sets or replaces the signed-in user's PIN (after first OTP login, or "Forgot PIN").
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please enter a PIN." }, { status: 400 });

  const problem = validatePin(parsed.data.pin);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  await prisma.user.update({
    where: { id: session.userId },
    data: { pinHash: await hashPin(parsed.data.pin), pinFailedAttempts: 0, pinLockedUntil: null },
  });
  return NextResponse.json({ success: true });
}
