import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name"),
  // Accept the "+91 98765 43210" format the forms suggest: drop spaces/dashes before validating.
  mobile: z
    .string()
    .transform((s) => s.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^\+?[0-9]{10,15}$/, "Enter a valid mobile number")),
  email: z.string().trim().email().optional().or(z.literal("")),
  requirements: z.string().trim().min(10, "Tell us a bit more about what you're looking for"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your details." }, { status: 400 });
  }

  const { name, mobile, email, requirements } = parsed.data;

  await prisma.customRequest.create({
    data: { name, mobile, email: email || null, requirements },
  });

  return NextResponse.json({ success: true });
}
