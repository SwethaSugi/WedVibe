"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { BUSINESS_ADDRESS, BUSINESS_NAME, SUPPORT_EMAIL, SUPPORT_HOURS, whatsappLink } from "@/lib/site-config";

const TOPICS = ["General question", "Help with my invitation", "Payment or refund", "Custom design", "Something else"];

const inputClass =
  "mt-1.5 w-full border border-[#e7dcd3] bg-[#fdfaf7] rounded-xl px-4 py-3 text-sm placeholder:text-neutral-400 transition-shadow focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e2b75a]/40 focus:border-[#d9b36a]";

function InfoCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 bg-white rounded-2xl border border-[#efe5dd] p-5 shadow-[0_10px_30px_rgba(90,60,40,0.06)]">
      <span className="w-11 h-11 shrink-0 rounded-xl bg-[#faf3ea] text-[#b0843a] flex items-center justify-center">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{title}</p>
        <div className="mt-1 text-neutral-800">{children}</div>
      </div>
    </div>
  );
}

const svg = (d: string) => (
  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

export default function ContactPage() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Messages land in Admin → Custom Requests, tagged with the topic.
      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, email, requirements: `[Contact · ${topic}] ${message}` }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Unable to send your message. Please try again.");
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full flex-1 bg-gradient-to-b from-[#fbf6f2] via-[#fdf9f6] to-[#f7ede7]">
      {/* Banner */}
      <section className="relative overflow-hidden bg-[#140d0e] text-white">
        <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-rose-700/25 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 right-0 w-[28rem] h-[28rem] rounded-full bg-amber-600/15 blur-3xl" aria-hidden />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <p className="text-xs uppercase tracking-[0.35em] text-[#d9b36a]">We&apos;re here to help</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">Contact Us</h1>
          <p className="mt-3 text-white/65 max-w-2xl">
            Questions about your invitation, a payment, or a custom design? Message us on WhatsApp or send us a note below — the{" "}
            {BUSINESS_NAME} team will get back to you.
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d9b36a]/60 to-transparent" aria-hidden />
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[1fr_1.2fr] gap-8 items-start">
        {/* Contact details */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-[#140d0e] text-white p-6">
            <div className="absolute -top-16 -right-12 w-48 h-48 rounded-full bg-[#25D366]/20 blur-3xl" aria-hidden />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.25em] text-[#d9b36a]">Fastest reply</p>
              <p className="mt-2 text-lg font-semibold">Chat with us on WhatsApp</p>
              <a
                href={whatsappLink(`Hi ${BUSINESS_NAME}! I have a question.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-[#25D366] text-white font-semibold shadow-[0_10px_30px_rgba(37,211,102,0.3)] hover:bg-[#1ebe5b] transition-colors"
              >
                <WhatsAppIcon />
                Message us on WhatsApp
              </a>
            </div>
          </div>

          {SUPPORT_EMAIL && (
            <InfoCard icon={svg("M3 5h14v10H3zM3 5l7 6 7-6")} title="Email">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium hover:text-rose-700 break-all">
                {SUPPORT_EMAIL}
              </a>
            </InfoCard>
          )}

          {BUSINESS_ADDRESS && (
            <InfoCard icon={svg("M10 18s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10zM10 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z")} title="Address">
              <p className="whitespace-pre-line">{BUSINESS_ADDRESS}</p>
            </InfoCard>
          )}

          <InfoCard icon={svg("M10 18a8 8 0 100-16 8 8 0 000 16zM10 6v4l2.5 2.5")} title="Support hours">
            <p>{SUPPORT_HOURS}</p>
          </InfoCard>

          <div className="bg-white/80 rounded-2xl border border-[#efe5dd] p-5 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Helpful links</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { href: "/refund-policy", label: "Refund & Cancellation" },
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/custom-invitation", label: "Custom Design" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="px-3 py-1.5 rounded-full border border-[#e7dcd3] text-neutral-700 hover:border-[#d9b36a] hover:bg-[#fdf8f1]">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Message form */}
        {sent ? (
          <div className="bg-white rounded-3xl border border-[#efe5dd] shadow-[0_18px_50px_rgba(90,60,40,0.10)] p-8 sm:p-10 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl">✓</div>
            <h2 className="text-2xl font-semibold mt-5">Message sent!</h2>
            <p className="text-neutral-500 mt-2">
              Thanks, {name.trim().split(" ")[0]}! We&apos;ve received your message and will reply on WhatsApp or by phone soon.
            </p>
            <Link href="/" className="inline-block mt-6 text-sm text-rose-600 hover:underline font-medium">
              ← Back to Home
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="relative bg-white rounded-3xl border border-[#efe5dd] shadow-[0_18px_50px_rgba(90,60,40,0.10)] p-6 sm:p-8 space-y-5 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#f3d68a] via-[#e2b75a] to-[#c99534]" aria-hidden />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#b0843a]">Send a message</p>
              <h2 className="text-2xl font-semibold tracking-tight mt-1">How can we help?</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-700">
                  Your Name<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">
                  WhatsApp Number<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <input required type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-700">Email (optional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Topic</label>
                <select value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass}>
                  {TOPICS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700">
                Message<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <textarea
                required
                minLength={10}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us how we can help. For payments, include your invitation ID or order ID."
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-[#140d0e] text-white font-semibold hover:bg-black hover:shadow-lg transition-all disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
