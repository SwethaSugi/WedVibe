import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeMobile } from "@/lib/phone";

const schema = z.object({ mobile: z.string() });

// Tells the login page whether this number signs in with a PIN or needs an OTP.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  const mobile = parsed.success ? normalizeMobile(parsed.data.mobile) : null;
  if (!mobile) {
    return NextResponse.json({ error: "Please enter a valid mobile number." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { mobile }, select: { pinHash: true, status: true } });
  // Stop here for disabled accounts, so no (paid) WhatsApp code is sent to them.
  if (user && user.status !== "ACTIVE") {
    return NextResponse.json({ error: "This account has been disabled. Please contact support." }, { status: 403 });
  }
  return NextResponse.json({ mobile, hasPin: !!user?.pinHash });
}
