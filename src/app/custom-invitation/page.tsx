"use client";

import { useState } from "react";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappLink } from "@/lib/site-config";

const DM_MESSAGE = "Hi WedVibe! I'd like a fully custom wedding invitation design. Can we discuss the details?";

const inputClass =
  "mt-1.5 w-full border border-[#e7dcd3] bg-[#fdfaf7] rounded-xl px-4 py-3 text-sm placeholder:text-neutral-400 transition-shadow focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e2b75a]/40 focus:border-[#d9b36a]";

const STEPS = [
  { title: "Share your idea", desc: "Tell us your style, colours, language and traditions — reference designs welcome." },
  { title: "We design it for you", desc: "Our design team crafts a one-of-a-kind invitation around your story." },
  { title: "Approve & share", desc: "Review it, request changes, then share your link with every guest." },
];

const OFFERS = ["Your colours & theme", "Any language", "Your own photos", "Multiple events", "Family & traditions", "Unique animations"];

export default function CustomInvitationPage() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [requirements, setRequirements] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, email, requirements }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to submit your request. Please try again.");
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  const dmButton = (label: string, className = "") => (
    <a
      href={whatsappLink(DM_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-[#25D366] text-white font-semibold shadow-[0_10px_30px_rgba(37,211,102,0.35)] hover:bg-[#1ebe5b] hover:-translate-y-0.5 active:translate-y-0 transition-all ${className}`}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );

  return (
    <div className="relative w-full flex-1 bg-gradient-to-b from-[#fbf6f2] via-[#fdf9f6] to-[#f7ede7] overflow-hidden">
      <div className="pointer-events-none absolute top-[460px] -left-40 w-[28rem] h-[28rem] rounded-full bg-rose-200/35 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute top-[820px] -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-200/30 blur-3xl" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{ backgroundImage: "radial-gradient(rgba(190,150,110,0.25) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        aria-hidden
      />

      {/* ===== Banner (Pexels #2983462, free licence) ===== */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/defaults/featured-ring-gold.jpg" alt="" aria-hidden className="wv-hero-drift absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/55" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fbf6f2] to-transparent" aria-hidden />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-28 sm:pt-20 sm:pb-32 text-center text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-[#f3d68a]">Made just for you</p>
          <h1 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            Your Invitation, Designed Just for You
          </h1>
          <p className="mt-4 text-white/85 max-w-2xl mx-auto drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
            Didn&apos;t find the perfect design among our templates? Tell us what you have in mind and our design team will
            create a one-of-a-kind invitation around your story.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {dmButton("Message us on WhatsApp", "w-full sm:w-auto")}
            <a
              href="#request-form"
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-white/70 text-white font-medium backdrop-blur-sm hover:bg-white/15 transition-colors"
            >
              Fill the request form
            </a>
          </div>
        </div>
      </section>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-20 -mt-12 grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
        {/* ===== Left: how it works + WhatsApp card ===== */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur rounded-3xl border border-white shadow-[0_18px_50px_rgba(90,60,40,0.10)] p-6 sm:p-7">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b0843a]">How it works</p>
            <ol className="mt-5 space-y-5">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#f3d68a] to-[#c99534] text-[#2b1a0c] font-semibold flex items-center justify-center shadow-sm">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-neutral-900">{s.title}</p>
                    <p className="text-sm text-neutral-500 mt-0.5">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 pt-5 border-t border-[#f1e8e1]">
              <p className="text-xs uppercase tracking-[0.3em] text-[#b0843a]">What we can create</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {OFFERS.map((o) => (
                  <span key={o} className="px-3 py-1.5 rounded-full text-xs bg-[#fdf5ec] border border-[#f1e2cc] text-[#7a5a2a]">
                    ✦ {o}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-[#140d0e] text-white p-6 sm:p-7">
            <div className="absolute -top-20 -right-16 w-60 h-60 rounded-full bg-[#25D366]/20 blur-3xl" aria-hidden />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9b36a]/60 to-transparent" aria-hidden />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d9b36a]">Prefer to chat?</p>
              <p className="mt-2 text-xl font-semibold">DM us on WhatsApp</p>
              <p className="mt-1 text-sm text-white/60">Share your ideas, photos and reference designs directly with our team.</p>
              {dmButton("Chat on WhatsApp", "mt-4 w-full")}
            </div>
          </div>
        </div>

        {/* ===== Right: request form ===== */}
        <div id="request-form" className="scroll-mt-24">
          {submitted ? (
            <div className="bg-white rounded-3xl border border-white shadow-[0_18px_50px_rgba(90,60,40,0.12)] p-8 sm:p-10 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl">✓</div>
              <h2 className="text-2xl font-semibold mt-5">Request received!</h2>
              <p className="text-neutral-500 mt-2">
                Thanks, {name.trim().split(" ")[0]}! Our design team will contact you on WhatsApp or by phone to discuss your custom
                invitation.
              </p>
              <p className="text-sm text-neutral-500 mt-5">Want to speed things up? Send us your reference photos now.</p>
              {dmButton("Send details on WhatsApp", "mt-3")}
              <div>
                <Link href="/templates" className="inline-block mt-6 text-sm text-rose-600 hover:underline font-medium">
                  Browse ready-made templates
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="relative bg-white rounded-3xl border border-white shadow-[0_18px_50px_rgba(90,60,40,0.12)] p-6 sm:p-8 space-y-5 overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#f3d68a] via-[#e2b75a] to-[#c99534]" aria-hidden />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#b0843a]">Request form</p>
                <h2 className="text-2xl font-semibold tracking-tight mt-1">Tell us about your dream invitation</h2>
                <p className="text-sm text-neutral-500 mt-1">We&apos;ll get back to you on WhatsApp or by phone.</p>
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

              <div>
                <label className="text-sm font-medium text-neutral-700">Email (optional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputClass} />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700">
                  What are you looking for?<span className="text-rose-500 ml-0.5">*</span>
                </label>
                <textarea
                  required
                  minLength={10}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Tell us about your wedding style, colours, language, traditions, or any reference designs you like…"
                  rows={6}
                  className={inputClass}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#140d0e] text-white font-semibold hover:bg-black hover:shadow-lg transition-all disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send Request"}
              </button>
              <p className="text-center text-xs text-neutral-400">
                or{" "}
                <a href={whatsappLink(DM_MESSAGE)} target="_blank" rel="noopener noreferrer" className="text-[#1a9e4b] font-medium hover:underline">
                  message us directly on WhatsApp
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Floating WhatsApp button */}
      <a
        href={whatsappLink(DM_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message us on WhatsApp"
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.45)] hover:scale-110 transition-transform"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" aria-hidden />
        <WhatsAppIcon className="relative w-7 h-7" />
      </a>
    </div>
  );
}
