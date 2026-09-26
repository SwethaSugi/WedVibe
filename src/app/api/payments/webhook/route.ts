import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { activatePaidOrder } from "@/lib/payment-activation";

// Razorpay webhook: Razorpay's servers call this directly when a payment is captured or fails,
// so an invitation is activated even if the customer closed the browser before the checkout
// could report back. Configure in Razorpay Dashboard → Account & Settings → Webhooks:
//   URL:    https://<your-domain>/api/payments/webhook
//   Secret: the same value as RAZORPAY_WEBHOOK_SECRET
//   Events: payment.captured, order.paid, payment.failed

interface RazorpayPaymentEntity {
  id: string;
  order_id: string | null;
  amount: number; // paise
  currency: string;
  status: string;
}

interface RazorpayWebhookBody {
  event: string;
  payload?: { payment?: { entity?: RazorpayPaymentEntity } };
}

function signatureIsValid(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Razorpay retries a webhook until it gets a 2xx, so anything we deliberately ignore still gets 200.
const ok = (note: string) => NextResponse.json({ ok: true, note });

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET is not set; rejecting webhook.");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  // The signature covers the exact raw body, so read it as text before parsing.
  const rawBody = await req.text();
  if (!signatureIsValid(rawBody, req.headers.get("x-razorpay-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let body: RazorpayWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const entity = body.payload?.payment?.entity;
  if (!entity?.order_id) return ok(`ignored ${body.event}: no order`);

  const payment = await prisma.payment.findUnique({ where: { orderId: entity.order_id } });
  if (!payment) return ok(`ignored ${body.event}: unknown order`);

  if (body.event === "payment.captured" || body.event === "order.paid") {
    // Never activate on a mismatched amount or currency.
    if (entity.amount !== payment.amount * 100 || entity.currency !== payment.currency) {
      console.error(
        `[razorpay-webhook] Amount mismatch for ${entity.order_id}: got ${entity.amount} ${entity.currency}, expected ${payment.amount * 100} ${payment.currency}`
      );
      return ok("ignored: amount mismatch");
    }

    const result = await activatePaidOrder(entity.order_id, entity.id);
    if (result.outcome === "duplicate") {
      console.warn(`[razorpay-webhook] Duplicate payment ${entity.id} on ${entity.order_id} — invitation already live; refund due.`);
    }
    return ok(result.outcome);
  }

  if (body.event === "payment.failed") {
    // Only an unpaid order can be marked failed; a captured payment is never downgraded.
    const { count } = await prisma.payment.updateMany({ where: { id: payment.id, status: "CREATED" }, data: { status: "FAILED" } });
    return ok(count ? "marked failed" : `unchanged (${payment.status})`);
  }

  return ok(`ignored ${body.event}`);
}
