"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { buildInviteMessage, type InviteMessageDetails } from "@/lib/invite-message";

interface SuccessDetails {
  order: { orderId: string; amount: number; status: string };
  invitation: InviteMessageDetails & { invitationCode: string; publicUrl: string | null };
}

function PaymentSuccess() {
  const orderId = useSearchParams().get("order");
  const router = useRouter();
  const [details, setDetails] = useState<SuccessDetails | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.replace("/dashboard");
      return;
    }
    fetch(`/api/payments/${orderId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (!d) {
          router.replace("/dashboard");
          return;
        }
        // Only a verified payment gets this screen; anything else goes back to checkout.
        if (d.order.status !== "SUCCESS" || !d.invitation.publicUrl) {
          router.replace(`/payment/${orderId}`);
          return;
        }
        setDetails(d);
      });
  }, [orderId, router]);

  if (!details || !details.invitation.publicUrl) {
    return <div className="flex-1 flex items-center justify-center text-neutral-400">Loading…</div>;
  }

  const { invitation, order } = details;
  const fullUrl = `${window.location.origin}${invitation.publicUrl}`;
  const message = buildInviteMessage(invitation, fullUrl);
  const shareText = encodeURIComponent(message);

  return (
    <div className="max-w-lg mx-auto px-6 py-16 text-center w-full">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto tpl-reveal tpl-reveal-in">
        ✓
      </div>
      <h1 className="text-2xl font-semibold mt-5">Payment successful — your invitation is live! 🎉</h1>
      <p className="text-neutral-500 mt-2 text-sm">
        Paid ₹{order.amount} · Invitation ID {invitation.invitationCode}
      </p>

      <div className="mt-6 text-left">
        <p className="text-xs uppercase tracking-wide text-neutral-400 mb-2">Your invitation message</p>
        <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 text-sm text-neutral-700 whitespace-pre-line break-words leading-relaxed">
          {message}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => {
            navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="px-6 py-3 rounded-full border border-neutral-300 font-medium hover:bg-neutral-50"
        >
          {copied ? "Invite copied ✓" : "Copy Link"}
        </button>
        <a
          href={`https://wa.me/?text=${shareText}`}
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 rounded-full bg-green-600 text-white font-medium hover:bg-green-700"
        >
          Share on WhatsApp
        </a>
        <a
          href={invitation.publicUrl ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 rounded-full bg-neutral-900 text-white font-medium hover:bg-neutral-700"
        >
          View Invitation
        </a>
        <Link href="/dashboard" className="text-sm text-neutral-500 mt-2 hover:underline">
          Go to My Invitations
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccess />
    </Suspense>
  );
}
