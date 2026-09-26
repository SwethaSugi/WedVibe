import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePin, PIN_LOCK_MINUTES, PIN_MAX_ATTEMPTS, setSessionCookie, signSession } from "@/lib/auth";
import { normalizeMobile } from "@/lib/phone";

const schema = z.object({ mobile: z.string(), pin: z.string() });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  const mobile = parsed.success ? normalizeMobile(parsed.data.mobile) : null;
  if (!parsed.success || !mobile) {
    return NextResponse.json({ error: "Incorrect mobile number or PIN." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { mobile } });
  if (!user || !user.pinHash) {
    return NextResponse.json({ error: "Incorrect mobile number or PIN." }, { status: 400 });
  }
  if (user.status !== "ACTIVE") {
    return NextResponse.json({ error: "This account has been disabled. Please contact support." }, { status: 403 });
  }
  if (user.pinLockedUntil && user.pinLockedUntil.getTime() > Date.now()) {
    return NextResponse.json(
      { error: "Too many wrong attempts. Try again later or log in with an OTP.", locked: true },
      { status: 429 }
    );
  }

  const valid = await comparePin(parsed.data.pin, user.pinHash);
  if (!valid) {
    const attempts = user.pinFailedAttempts + 1;
    const locked = attempts >= PIN_MAX_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pinFailedAttempts: locked ? 0 : attempts,
        pinLockedUntil: locked ? new Date(Date.now() + PIN_LOCK_MINUTES * 60 * 1000) : null,
      },
    });
    if (locked) {
      return NextResponse.json(
        { error: `Too many wrong attempts. PIN login is locked for ${PIN_LOCK_MINUTES} minutes — log in with an OTP instead.`, locked: true },
        { status: 429 }
      );
    }
    const left = PIN_MAX_ATTEMPTS - attempts;
    return NextResponse.json(
      { error: `Incorrect PIN. ${left} attempt${left === 1 ? "" : "s"} left.` },
      { status: 400 }
    );
  }

  if (user.pinFailedAttempts > 0 || user.pinLockedUntil) {
    await prisma.user.update({ where: { id: user.id }, data: { pinFailedAttempts: 0, pinLockedUntil: null } });
  }
  await setSessionCookie(signSession({ userId: user.id, mobile: user.mobile }));
  return NextResponse.json({ success: true, user: { id: user.id, mobile: user.mobile, name: user.name } });
}
