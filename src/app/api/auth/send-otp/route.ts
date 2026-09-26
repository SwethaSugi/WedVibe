import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOtp, hashOtp } from "@/lib/auth";
import { sendWhatsAppOtp } from "@/lib/providers/whatsapp";
import { normalizeMobile } from "@/lib/phone";

const schema = z.object({
  mobile: z.string().transform((v, ctx) => normalizeMobile(v) ?? (ctx.addIssue({ code: "custom" }), z.NEVER)),
});

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid mobile number." }, { status: 400 });
  }

  const { mobile } = parsed.data;

  const recent = await prisma.otpVerification.findFirst({
    where: { mobile },
    orderBy: { createdAt: "desc" },
  });
  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return NextResponse.json({ error: "Please wait before requesting another OTP." }, { status: 429 });
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);

  await prisma.otpVerification.create({
    data: {
      mobile,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  try {
    await sendWhatsAppOtp(mobile, otp);
  } catch {
    return NextResponse.json({ error: "Unable to send OTP. Please try again." }, { status: 502 });
  }

  // Surface the OTP directly in the API response only in local/test mode with the mock
  // WhatsApp provider — never in production, and never once a real provider is configured.
  const isTestMode = process.env.NODE_ENV !== "production" && (process.env.WHATSAPP_PROVIDER ?? "mock") === "mock";

  return NextResponse.json({
    success: true,
    resendInSeconds: RESEND_COOLDOWN_MS / 1000,
    ...(isTestMode ? { devOtp: otp } : {}),
  });
}
