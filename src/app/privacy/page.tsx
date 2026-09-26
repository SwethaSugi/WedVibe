import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/LegalPage";
import { BUSINESS_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Privacy Policy — ${BUSINESS_NAME}`,
  description: `How ${BUSINESS_NAME} collects, uses and protects your personal information.`,
};

const UPDATED = "27 September 2026";

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <p>
        This policy explains what personal information {BUSINESS_NAME} collects when you use our website, why we collect it, and how
        we keep it safe. We handle personal data in line with applicable Indian law, including the Digital Personal Data Protection
        Act, 2023.
      </p>
    ),
  },
  {
    id: "collect",
    title: "Information we collect",
    body: (
      <>
        <p>We only collect what we need to run the service:</p>
        <ul>
          <li>
            <strong>Account details</strong> — your mobile number and name. Your login PIN is stored only in encrypted (hashed) form; we
            cannot read it.
          </li>
          <li>
            <strong>Invitation details</strong> — the names, family details, dates, venues, messages, events and photos you add to an
            invitation.
          </li>
          <li>
            <strong>Payment records</strong> — order ID, amount, payment status and date. Card, UPI and bank details are handled by
            Razorpay and never reach our servers.
          </li>
          <li>
            <strong>Custom design requests</strong> — the name, WhatsApp number, optional email and requirements you submit.
          </li>
          <li>
            <strong>Basic usage data</strong> — for example, how many times an invitation link has been opened. We do not use
            advertising trackers.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use your information",
    body: (
      <ul>
        <li>To create your account and verify your mobile number with a one-time password (OTP).</li>
        <li>To build, display and host your invitation at its unique link.</li>
        <li>To process payments and keep payment records required by law.</li>
        <li>To respond to custom design requests and support questions.</li>
        <li>To keep the service secure and prevent fraud or misuse.</li>
      </ul>
    ),
  },
  {
    id: "public",
    title: "What is visible to others",
    body: (
      <p>
        Your invitation is meant to be shared. <strong>Anyone who has your invitation link can see its contents</strong>, including the
        names, dates, venues and photos you added. Please only include information you are comfortable sharing with your guests. Draft
        invitations are not visible to anyone except you.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Who we share information with",
    body: (
      <>
        <p>We do not sell your personal information. We share it only with service providers that help us run the platform:</p>
        <ul>
          <li>
            <strong>Razorpay</strong> — to process your payments securely.
          </li>
          <li>
            <strong>WhatsApp messaging provider</strong> — to deliver your one-time password.
          </li>
          <li>
            <strong>Hosting and storage providers</strong> — to store your account, invitations and photos.
          </li>
          <li>
            <strong>Google Fonts</strong> — invitation designs load fonts from Google, which receives your device&apos;s IP address when
            a page loads.
          </li>
        </ul>
        <p>We may also disclose information if required by law or to protect the rights and safety of our users.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        We use a single essential, secure cookie to keep you signed in. We do not use advertising or tracking cookies. If you block
        cookies you will not be able to log in.
      </p>
    ),
  },
  {
    id: "security",
    title: "How we protect your information",
    body: (
      <ul>
        <li>Login codes and PINs are stored only in hashed form.</li>
        <li>Your sign-in session is kept in a secure, HTTP-only cookie that page scripts cannot read.</li>
        <li>Payments are verified with the gateway&apos;s cryptographic signature before an invitation is activated.</li>
        <li>Access to administration tools is restricted to authorised staff.</li>
      </ul>
    ),
  },
  {
    id: "retention",
    title: "How long we keep information",
    body: (
      <p>
        We keep your account and invitations for as long as your account is active, so your invitation link keeps working. Payment
        records are kept for the period required by tax and accounting laws. When you ask us to delete your data, we remove it unless we
        are legally required to keep it.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <p>You can ask us to:</p>
        <ul>
          <li>access the personal information we hold about you;</li>
          <li>correct inaccurate information;</li>
          <li>delete your account, invitations and photos;</li>
          <li>withdraw consent for optional processing.</li>
        </ul>
        <p>
          To make a request, reach us through our <Link href="/contact">Contact page</Link>. We may need to verify your mobile number
          before acting on it.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: <p>The service is intended for adults. We do not knowingly collect personal information from children under 18.</p>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top shows when it last changed.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <p>
        For any privacy question or request, reach us through our <Link href="/contact">Contact page</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro={`Your wedding details are personal. Here is exactly what ${BUSINESS_NAME} collects, why, and how we keep it safe.`}
      updated={UPDATED}
      current="/privacy"
      sections={sections}
    />
  );
}
