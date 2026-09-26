import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { BUSINESS_NAME } from "@/lib/site-config";
import { MAX_LIVE_EDITS, LIVE_EDIT_WINDOW_DAYS } from "@/lib/edit-policy";

export const metadata: Metadata = {
  title: `Refund & Cancellation Policy — ${BUSINESS_NAME}`,
  description: `When ${BUSINESS_NAME} payments can be cancelled or refunded, and how to request a refund.`,
};

const UPDATED = "27 September 2026";

// Business timelines referenced below — adjust here if the policy changes.
const REQUEST_WINDOW_DAYS = 7;
const REFUND_BUSINESS_DAYS = "5–7";

const sections: LegalSection[] = [
  {
    id: "summary",
    title: "Summary",
    body: (
      <ul>
        <li>You can preview every template and your own invitation for free before paying.</li>
        <li>Each invitation is a one-time digital purchase that is delivered instantly when your payment succeeds.</li>
        <li>
          If money is deducted but your invitation is not activated, or you are charged twice, you get a <strong>full refund</strong>.
        </li>
        <li>
          Approved refunds reach your original payment method within <strong>{REFUND_BUSINESS_DAYS} business days</strong>.
        </li>
      </ul>
    ),
  },
  {
    id: "before-payment",
    title: "Cancelling before payment",
    body: (
      <p>
        Creating and editing a draft is free. You can remove a draft invitation at any time from <strong>My Invitations</strong>, and
        nothing is charged unless you complete a payment.
      </p>
    ),
  },
  {
    id: "after-payment",
    title: "After a successful payment",
    body: (
      <>
        <p>
          Your invitation link is created and delivered immediately after the payment is confirmed. Because this is a digital service
          that is delivered instantly, <strong>payments for a successfully activated invitation are not refundable</strong> — for
          example because of a change of plans, a change of mind, or choosing a different design later.
        </p>
        <p>
          You can still correct mistakes: a live invitation can be edited up to {MAX_LIVE_EDITS} times within {LIVE_EDIT_WINDOW_DAYS}{" "}
          days of going live. If you need your invitation taken offline, contact us and we will deactivate the link.
        </p>
      </>
    ),
  },
  {
    id: "eligible",
    title: "When you are eligible for a refund",
    body: (
      <>
        <p>We will refund the full amount you paid when:</p>
        <ul>
          <li>
            <strong>Money was deducted but the invitation was not activated</strong> — for example, the payment failed or stayed pending
            on our side. Such amounts are usually reversed automatically by the bank or payment gateway; if not, we refund them on request.
          </li>
          <li>
            <strong>You were charged more than once</strong> for the same invitation — the extra payment is refunded.
          </li>
          <li>
            <strong>A technical fault on our side</strong> stops your invitation from working and we cannot fix it within 72 hours of your
            report.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "not-eligible",
    title: "When refunds are not available",
    body: (
      <ul>
        <li>The invitation was activated and works as shown in the preview.</li>
        <li>The request is made more than {REQUEST_WINDOW_DAYS} days after the payment.</li>
        <li>
          The invitation was deactivated because it broke our <Link href="/terms">Terms &amp; Conditions</Link> (for example unlawful or
          infringing content).
        </li>
        <li>Mistakes in details you entered — these can be fixed using your edits.</li>
      </ul>
    ),
  },
  {
    id: "custom",
    title: "Custom design orders",
    body: (
      <p>
        Custom invitations are quoted individually. The price, delivery timeline and any advance payment are agreed with our design team
        before work begins. If we are unable to deliver a custom design we have accepted, we refund any amount paid for work not yet
        started.
      </p>
    ),
  },
  {
    id: "how",
    title: "How to request a refund",
    body: (
      <>
        <p>
          Reach us through our <Link href="/contact">Contact page</Link> within {REQUEST_WINDOW_DAYS} days of the payment, and share:
        </p>
        <ul>
          <li>the mobile number you used to log in;</li>
          <li>your invitation ID or payment order ID (shown on the payment confirmation page and in My Invitations);</li>
          <li>a short description of the problem, with a screenshot of the deducted payment if relevant.</li>
        </ul>
        <p>We review every request and reply within 2 business days.</p>
      </>
    ),
  },
  {
    id: "timeline",
    title: "Refund timeline",
    body: (
      <p>
        Approved refunds are processed to the original payment method (UPI, card, net banking or wallet) through Razorpay. The amount
        usually reflects in your account within <strong>{REFUND_BUSINESS_DAYS} business days</strong>, depending on your bank.
      </p>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund & Cancellation Policy"
      intro="Clear and fair: here is when an invitation payment can be cancelled or refunded, and how to ask for it."
      updated={UPDATED}
      current="/refund-policy"
      sections={sections}
    />
  );
}
