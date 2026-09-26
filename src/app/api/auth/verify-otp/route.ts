import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { compareOtp, signSession, setSessionCookie } from "@/lib/auth";
import { normalizeMobile } from "@/lib/phone";

const schema = z.object({
  mobile: z.string().transform((v, ctx) => normalizeMobile(v) ?? (ctx.addIssue({ code: "custom" }), z.NEVER)),
  otp: z.string().length(6),
});

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
  }

  const { mobile, otp } = parsed.data;

  const record = await prisma.otpVerification.findFirst({
    where: { mobile, verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return NextResponse.json({ error: "Please request a new OTP." }, { status: 400 });
  }
  if (record.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "OTP has expired." }, { status: 400 });
  }
  if (record.attemptCount >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many attempts. Please request a new OTP." }, { status: 429 });
  }

  const isValid = await compareOtp(otp, record.otpHash);
  if (!isValid) {
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { attemptCount: { increment: 1 } },
    });
    return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
  }

  let user = await prisma.user.findUnique({ where: { mobile } });
  if (!user) {
    user = await prisma.user.create({ data: { mobile } });
  }
  if (user.status !== "ACTIVE") {
    return NextResponse.json({ error: "This account has been disabled. Please contact support." }, { status: 403 });
  }

  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { verified: true, userId: user.id },
  });
  // Proving ownership of the number by OTP clears any PIN lockout ("Forgot PIN" flow).
  if (user.pinFailedAttempts > 0 || user.pinLockedUntil) {
    user = await prisma.user.update({ where: { id: user.id }, data: { pinFailedAttempts: 0, pinLockedUntil: null } });
  }

  const token = signSession({ userId: user.id, mobile: user.mobile });
  await setSessionCookie(token);

  return NextResponse.json({
    success: true,
    user: { id: user.id, mobile: user.mobile, name: user.name, hasPin: !!user.pinHash },
  });
}
