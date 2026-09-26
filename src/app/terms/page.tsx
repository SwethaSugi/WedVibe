import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { BUSINESS_NAME } from "@/lib/site-config";
import { MAX_LIVE_EDITS, LIVE_EDIT_WINDOW_DAYS } from "@/lib/edit-policy";

export const metadata: Metadata = {
  title: `Terms & Conditions — ${BUSINESS_NAME}`,
  description: `The terms that apply when you use ${BUSINESS_NAME} to create and share digital wedding invitations.`,
};

const UPDATED = "27 September 2026";

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <>
        <p>
          {BUSINESS_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides an online platform to create, personalise and share digital
          wedding invitations through a unique web link. By creating an account, making a payment or otherwise using the website, you
          (&ldquo;you&rdquo;, &ldquo;the customer&rdquo;) agree to these Terms &amp; Conditions, our{" "}
          <Link href="/privacy">Privacy Policy</Link> and our <Link href="/refund-policy">Refund &amp; Cancellation Policy</Link>.
        </p>
        <p>If you do not agree with these terms, please do not use the service.</p>
      </>
    ),
  },
  {
    id: "account",
    title: "Your account",
    body: (
      <ul>
        <li>You sign in with your mobile number. The first login is verified with a one-time password (OTP) sent on WhatsApp; after that you can log in with a PIN you set.</li>
        <li>You are responsible for keeping your PIN private and for all activity on your account.</li>
        <li>You must provide accurate information and be at least 18 years old, or use the service with the consent of a parent or guardian.</li>
        <li>We may suspend or disable an account that is used for fraud, abuse or content that breaks these terms.</li>
      </ul>
    ),
  },
  {
    id: "service",
    title: "The service",
    body: (
      <>
        <p>You choose a template, enter your wedding details, optionally upload photos, and preview the invitation before paying.</p>
        <ul>
          <li>Each invitation is a one-time purchase at the price shown for its template. There are no subscriptions.</li>
          <li>Your unique invitation link is created only after your payment is successfully confirmed.</li>
          <li>Anyone who has the link can view the invitation. You decide whom you share it with.</li>
          <li>
            After an invitation goes live you can edit it up to <strong>{MAX_LIVE_EDITS} times</strong> within{" "}
            <strong>{LIVE_EDIT_WINDOW_DAYS} days</strong> of going live. After that, editing closes and the invitation stays live as it is.
          </li>
          <li>Custom design requests are quoted and agreed separately with our design team before any work begins.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payments",
    title: "Prices and payments",
    body: (
      <ul>
        <li>All prices are in Indian Rupees (₹) and are shown on each template before you pay.</li>
        <li>
          Payments are processed securely by our payment partner, Razorpay, using UPI, cards, net banking or wallets. We do not see or
          store your card or bank details.
        </li>
        <li>An invitation is marked paid only after the payment gateway confirms the payment.</li>
        <li>Refunds and cancellations are covered by our <Link href="/refund-policy">Refund &amp; Cancellation Policy</Link>.</li>
      </ul>
    ),
  },
  {
    id: "content",
    title: "Your content",
    body: (
      <>
        <p>
          You keep ownership of the names, details, messages and photos you add (&ldquo;your content&rdquo;). You give us permission to
          store and display your content only to provide the service — for example, to show it on your invitation page.
        </p>
        <p>You confirm that you have the right to use everything you upload, and that your content does not:</p>
        <ul>
          <li>infringe anyone&apos;s copyright, trademark or privacy;</li>
          <li>contain unlawful, hateful, obscene or misleading material;</li>
          <li>impersonate another person or promote fraud.</li>
        </ul>
        <p>We may remove content or deactivate an invitation that breaks these rules, with or without prior notice.</p>
      </>
    ),
  },
  {
    id: "our-ip",
    title: "Our designs and website",
    body: (
      <p>
        The templates, designs, graphics, code and branding of {BUSINESS_NAME} belong to us or our licensors. Buying an invitation gives
        you a personal licence to use that design for your own event. You may not copy, resell or redistribute our templates or website.
      </p>
    ),
  },
  {
    id: "availability",
    title: "Availability of your invitation",
    body: (
      <p>
        We work to keep invitation links online and working, but we cannot guarantee uninterrupted availability — for example during
        maintenance or problems with our hosting or internet providers. We will make reasonable efforts to restore access quickly if
        something goes wrong.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>
        The service is provided &ldquo;as is&rdquo;. To the extent permitted by law, we are not liable for indirect or consequential
        losses, and our total liability for any claim relating to an invitation is limited to the amount you paid for that invitation.
        Nothing in these terms limits rights you have under applicable consumer protection law.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms from time to time. The &ldquo;Last updated&rdquo; date at the top shows when they last changed.
        Continuing to use the service after an update means you accept the updated terms.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of India. Any dispute will be subject to the jurisdiction of the competent courts at our
        registered place of business in India.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <p>
        Questions about these terms? Reach us through our <Link href="/contact">Contact page</Link>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro={`Please read these terms carefully before using ${BUSINESS_NAME} to create and share your digital wedding invitation.`}
      updated={UPDATED}
      current="/terms"
      sections={sections}
    />
  );
}
