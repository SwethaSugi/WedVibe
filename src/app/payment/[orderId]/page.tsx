"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { nanoid } from "nanoid";

interface OrderResponse {
  order: { orderId: string; amount: number; currency: string; status: string };
  invitation: {
    id: string;
    invitationCode: string;
    groomName: string;
    brideName: string;
    weddingDate: string;
    templateName: string;
  };
  customer: { name: string | null; mobile: string };
  checkout: { provider: "mock" | "razorpay"; keyId: string | null };
}

type Method = "upi" | "card" | "netbanking" | "wallet";

const METHODS: { id: Method; icon: string; title: string; subtitle: string }[] = [
  { id: "upi", icon: "📱", title: "UPI", subtitle: "Google Pay, PhonePe, Paytm or any UPI app" },
  { id: "card", icon: "💳", title: "Credit / Debit Card", subtitle: "Visa, Mastercard, RuPay" },
  { id: "netbanking", icon: "🏦", title: "Net Banking", subtitle: "All major Indian banks" },
  { id: "wallet", icon: "👛", title: "Wallets", subtitle: "Paytm, PhonePe, Amazon Pay and more" },
];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [details, setDetails] = useState<OrderResponse | null>(null);
  const [loadError, setLoadError] = useState("");
  const [method, setMethod] = useState<Method>("upi");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [showTestGateway, setShowTestGateway] = useState(false);

  useEffect(() => {
    fetch(`/api/payments/${orderId}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push(`/login?next=/payment/${orderId}`);
          return;
        }
        const d = await res.json();
        if (!res.ok) {
          setLoadError(d.error ?? "Unable to load this payment.");
          return;
        }
        if (d.order.status === "SUCCESS") {
          router.replace(`/payment/success?order=${orderId}`);
          return;
        }
        setDetails(d);
      })
      .catch(() => setLoadError("Unable to load this payment."));
  }, [orderId, router]);

  const verify = useCallback(
    async (paymentId: string, signature?: string) => {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentId, signature }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Payment verification failed. If money was deducted, it will be refunded automatically.");
        setPaying(false);
        return;
      }
      router.replace(`/payment/success?order=${orderId}`);
    },
    [orderId, router]
  );

  async function handlePay() {
    if (!details) return;
    setError("");
    setPaying(true);

    if (details.checkout.provider === "mock") {
      setShowTestGateway(true);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay || !details.checkout.keyId) {
      setError("Unable to open the payment window. Please check your connection and try again.");
      setPaying(false);
      return;
    }

    const rzp = new window.Razorpay({
      key: details.checkout.keyId,
      amount: details.order.amount * 100,
      currency: details.order.currency,
      order_id: details.order.orderId,
      name: "WedVibe",
      description: `${details.invitation.templateName} invitation`,
      prefill: { name: details.customer.name ?? "", contact: details.customer.mobile, method },
      theme: { color: "#e11d48" },
      handler: (resp: { razorpay_payment_id: string; razorpay_signature: string }) =>
        verify(resp.razorpay_payment_id, resp.razorpay_signature),
      modal: { ondismiss: () => setPaying(false) },
    });
    rzp.on("payment.failed", () => {
      setError("Payment failed. No money was charged — please try again or use a different method.");
      setPaying(false);
    });
    rzp.open();
  }

  async function simulateTestPayment(outcome: "success" | "failure") {
    setShowTestGateway(false);
    await new Promise((r) => setTimeout(r, 1200));
    if (outcome === "success") {
      await verify(`mockpay_${nanoid(12)}`);
      return;
    }
    await fetch(`/api/payments/${orderId}/fail`, { method: "POST" });
    setDetails((d) => (d ? { ...d, order: { ...d.order, status: "FAILED" } } : d));
    setPaying(false);
  }

  async function retry() {
    if (!details) return;
    setError("");
    setPaying(true);
    const res = await fetch(`/api/invitations/${details.invitation.id}/generate`, { method: "POST" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok || !d.orderId) {
      setError(d.error ?? "Unable to start a new payment. Please try again.");
      setPaying(false);
      return;
    }
    router.replace(`/payment/${d.orderId}`);
  }

  if (loadError) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center w-full">
        <p className="text-neutral-500">{loadError}</p>
        <Link href="/dashboard" className="inline-block mt-4 text-rose-600 font-medium hover:underline">
          Go to My Invitations
        </Link>
      </div>
    );
  }

  if (!details) {
    return <div className="flex-1 flex items-center justify-center text-neutral-400">Loading payment…</div>;
  }

  const { order, invitation } = details;
  const couple = `${invitation.groomName} & ${invitation.brideName}`;
  const isTestMode = details.checkout.provider === "mock";

  if (order.status === "FAILED") {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center w-full">
        <p className="text-4xl mb-3">⚠️</p>
        <h1 className="text-2xl font-semibold">Payment failed</h1>
        <p className="text-neutral-500 mt-2">
          No money was charged and your invitation has not been published yet. You can try again.
        </p>
        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={retry}
            disabled={paying}
            className="px-6 py-3 rounded-full bg-rose-600 text-white font-medium hover:bg-rose-700 disabled:opacity-60"
          >
            {paying ? "Starting…" : `Try again · ₹${order.amount}`}
          </button>
          <Link href={`/editor/${invitation.id}`} className="text-sm text-neutral-500 hover:underline">
            Back to editor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full">
        <Link href={`/editor/${invitation.id}`} className="text-sm text-neutral-500 hover:text-neutral-800">
          Back to editor
        </Link>
        <h1 className="text-2xl font-semibold mt-3">Complete your payment</h1>
        <p className="text-neutral-500 text-sm mt-1">Your invitation link is created as soon as the payment succeeds.</p>

        {isTestMode && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            Test mode — no real money is charged.
          </div>
        )}

        <div className="mt-6 grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
            <h2 className="font-semibold text-neutral-800 mb-4">Choose a payment method</h2>
            <div className="space-y-3">
              {METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    method === m.id ? "border-rose-400 bg-rose-50/60 ring-2 ring-rose-500/20" : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m.id}
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                    className="accent-rose-600"
                  />
                  <span className="text-2xl">{m.icon}</span>
                  <span>
                    <span className="block font-medium text-neutral-800">{m.title}</span>
                    <span className="block text-xs text-neutral-500">{m.subtitle}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-4 flex items-center gap-1.5">
              🔒 Payments are processed securely by our payment partner. We never see or store your card or bank details.
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 md:sticky md:top-24">
              <h2 className="font-semibold text-neutral-800">Order summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Invitation</span>
                  <span className="font-medium text-right">{couple}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500">Template</span>
                  <span className="text-right">{invitation.templateName}</span>
                </div>
                {invitation.weddingDate && (
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Wedding date</span>
                    <span className="text-right">
                      {new Date(invitation.weddingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}
                <div className="border-t border-neutral-100 pt-3 mt-3 flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>₹{order.amount}</span>
                </div>
              </div>

              {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

              <button
                onClick={handlePay}
                disabled={paying}
                className="mt-5 w-full py-3 rounded-full bg-rose-600 text-white font-medium shadow-sm hover:bg-rose-700 hover:shadow-md transition-all disabled:opacity-60"
              >
                {paying ? "Processing…" : `Pay ₹${order.amount}`}
              </button>
              <p className="text-[11px] text-neutral-400 text-center mt-2">One-time payment · No subscription</p>
              <p className="text-[11px] text-neutral-400 text-center mt-1.5 leading-relaxed">
                By paying you agree to our{" "}
                <Link href="/terms" target="_blank" className="underline hover:text-neutral-600">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/refund-policy" target="_blank" className="underline hover:text-neutral-600">
                  Refund Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {showTestGateway && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-6">
          <div className="wv-dropdown-in bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <p className="text-xs uppercase tracking-wide text-amber-600 font-semibold">Test payment gateway</p>
            <h3 className="text-lg font-semibold mt-2">
              Pay ₹{order.amount} via {METHODS.find((m) => m.id === method)?.title}
            </h3>
            <p className="text-sm text-neutral-500 mt-2">
              No real money moves in test mode. Choose how this payment should turn out.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => simulateTestPayment("success")}
                className="py-2.5 rounded-full bg-emerald-600 text-white font-medium hover:bg-emerald-700"
              >
                Simulate successful payment
              </button>
              <button
                onClick={() => simulateTestPayment("failure")}
                className="py-2.5 rounded-full border border-red-200 text-red-600 font-medium hover:bg-red-50"
              >
                Simulate failed payment
              </button>
              <button
                onClick={() => {
                  setShowTestGateway(false);
                  setPaying(false);
                }}
                className="text-sm text-neutral-500 mt-1 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
