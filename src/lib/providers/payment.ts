// Payment gateway provider abstraction, selected by PAYMENT_PROVIDER:
//   "razorpay" — real payments via Razorpay Checkout (needs PAYMENT_GATEWAY_KEY = key id and
//                PAYMENT_GATEWAY_SECRET = key secret). Payments are verified server-side by
//                checking Razorpay's HMAC signature before an invitation is activated.
//   "mock"     — local testing only: a simulated checkout, no money moves. Refused in
//                production so a misconfigured deploy can never hand out free invitations.

import crypto from "crypto";
import { nanoid } from "nanoid";

export type PaymentProvider = "mock" | "razorpay";

export function getPaymentProvider(): PaymentProvider {
  return process.env.PAYMENT_PROVIDER === "razorpay" ? "razorpay" : "mock";
}

export interface CreateOrderResult {
  orderId: string;
  amount: number; // whole rupees
  currency: string;
  gateway: string;
}

export interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature?: string;
}

export async function createPaymentOrder(amount: number, currency: string, receipt: string): Promise<CreateOrderResult> {
  const provider = getPaymentProvider();

  if (provider === "razorpay") {
    const keyId = process.env.PAYMENT_GATEWAY_KEY;
    const keySecret = process.env.PAYMENT_GATEWAY_SECRET;
    if (!keyId || !keySecret) throw new Error("Razorpay keys are not configured.");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({ amount: amount * 100, currency, receipt }),
    });
    if (!res.ok) throw new Error(`Razorpay order creation failed: ${res.status}`);
    const order = await res.json();
    return { orderId: order.id, amount, currency, gateway: "RAZORPAY" };
  }

  return { orderId: `order_${nanoid(14)}`, amount, currency, gateway: "MOCK" };
}

export function verifyPayment({ orderId, paymentId, signature }: VerifyPaymentInput): boolean {
  const provider = getPaymentProvider();

  if (provider === "razorpay") {
    const keySecret = process.env.PAYMENT_GATEWAY_SECRET;
    if (!keySecret || !signature) return false;
    const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  if (process.env.NODE_ENV === "production") return false;
  return paymentId.startsWith("mockpay_");
}

// Safe to send to the browser: Razorpay's key id is public; the secret never leaves the server.
export function getCheckoutConfig(): { provider: PaymentProvider; keyId: string | null } {
  const provider = getPaymentProvider();
  return { provider, keyId: provider === "razorpay" ? (process.env.PAYMENT_GATEWAY_KEY ?? null) : null };
}
