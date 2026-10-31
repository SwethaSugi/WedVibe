"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { designCountLabel } from "@/lib/design-count";
import { priceInfo } from "@/lib/pricing";
import { PriceTag } from "@/components/PriceTag";
import { OrderOnWhatsAppButton } from "@/components/OrderOnWhatsAppButton";
import { ORDER_MODE, whatsappLink } from "@/lib/site-config";
import { OCCASIONS, isOccasion, type OccasionKey } from "@/lib/occasions";

interface TemplateItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  occasion: string;
  price: number;
  offerPrice: number | null;
  currency: string;
  previewImage: string | null;
}

// Display order for category filters; only categories that currently have templates are shown.
const CATEGORY_ORDER = [
  "Traditional", "Modern", "Minimal", "Royal", "Floral", "South Indian", "North Indian",
  "Muslim Wedding", "Christian Wedding", "Destination", "Reception", "Engagement", "Haldi", "Mehendi", "Multi-Event",
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<OccasionKey>("wedding");

  function chooseOccasion(key: OccasionKey) {
    setOccasion(key);
    setActiveCategory(null);
    const url = new URL(window.location.href);
    if (key === "wedding") url.searchParams.delete("occasion");
    else url.searchParams.set("occasion", key);
    window.history.replaceState(null, "", url);
  }

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((d) => {
        // ?occasion=baby-family opens that tab directly (handy for sharing).
        const q = new URLSearchParams(window.location.search).get("occasion");
        if (isOccasion(q)) setOccasion(q);
        setTemplates(d.templates ?? []);
      })
      .catch(() => setTemplates([]));
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of templates ?? []) c[t.occasion ?? "wedding"] = (c[t.occasion ?? "wedding"] ?? 0) + 1;
    return c;
  }, [templates]);

  const inOccasion = useMemo(() => (templates ?? []).filter((t) => (t.occasion ?? "wedding") === occasion), [templates, occasion]);
  const current = OCCASIONS.find((o) => o.key === occasion)!;

  const categories = useMemo(() => {
    const present = new Set(inOccasion.map((t) => t.category));
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    const extra = [...present].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
    return [...ordered, ...extra];
  }, [inOccasion]);

  const visible = useMemo(
    () => inOccasion.filter((t) => !activeCategory || t.category === activeCategory),
    [inOccasion, activeCategory]
  );


  const chip = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm transition-all ${
      active
        ? "bg-neutral-900 text-white shadow-md"
        : "bg-white/70 text-neutral-700 border border-neutral-200 hover:bg-white hover:border-rose-200 hover:text-rose-700"
    }`;

  return (
    <div className="relative w-full flex-1 bg-gradient-to-b from-[#fbf6f2] via-[#fdf9f6] to-[#f7ede7] overflow-hidden">
      {/* Soft decorative glows behind the grid */}
      <div className="pointer-events-none absolute top-[420px] -left-40 w-[28rem] h-[28rem] rounded-full bg-rose-200/35 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute top-[900px] -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-200/30 blur-3xl" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{ backgroundImage: "radial-gradient(rgba(190,150,110,0.25) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        aria-hidden
      />

      {/* ===== Banner ===== */}
      <section className="relative overflow-hidden">
        {/* Pexels #35005577 (free licence) under an even dark shade, fading into the page */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/defaults/pricing.jpg" alt="" aria-hidden className="wv-hero-drift absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/55" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fbf6f2] to-transparent" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-28 sm:pt-20 sm:pb-32 text-center text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-[#f3d68a]">{(templates && designCountLabel(templates.length) && `${designCountLabel(templates.length)} designs`) || "Designs"}</p>
          <h1 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            Invitation Templates
          </h1>
          <p className="mt-3 text-white/85 max-w-xl mx-auto drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
            Weddings, baby functions, housewarmings and more. Pick a design, preview it, then personalise it with your own details.
          </p>
        </div>
      </section>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-16 w-full">
        {/* Occasion: the main filter */}
        <div className="-mt-16 relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" role="tablist" aria-label="Invitation categories">
          {OCCASIONS.map((o) => {
            const active = o.key === occasion;
            const n = counts[o.key] ?? 0;
            return (
              <button
                key={o.key}
                role="tab"
                aria-selected={active}
                onClick={() => chooseOccasion(o.key)}
                className={`group text-left rounded-2xl p-4 sm:p-5 border transition-all duration-300 ${
                  active
                    ? "bg-gradient-to-br from-[#5b1530] to-[#8f1d45] text-white border-transparent shadow-[0_18px_40px_rgba(91,21,48,0.35)] -translate-y-0.5"
                    : "bg-white/85 backdrop-blur-md border-white text-neutral-800 shadow-[0_14px_40px_rgba(90,60,40,0.10)] hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(90,60,40,0.16)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl ${active ? "bg-white/15" : "bg-[#fbf1ea]"}`} aria-hidden>
                    {o.icon}
                  </span>
                  {templates !== null && (
                    <span
                      className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        n > 0 ? (active ? "bg-white/20 text-white" : "bg-rose-50 text-rose-700") : active ? "bg-amber-300/25 text-amber-100" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {n > 0 ? `${n} design${n === 1 ? "" : "s"}` : "Coming soon"}
                    </span>
                  )}
                </div>
                <p className="mt-3 font-semibold text-[15px] sm:text-base leading-snug">{o.label}</p>
                <p className={`mt-0.5 text-xs sm:text-[13px] leading-snug ${active ? "text-white/75" : "text-neutral-500"}`}>{o.hint}</p>
              </button>
            );
          })}
        </div>

        {categories.length > 1 && (
          <div className="mt-6 relative z-10 rounded-3xl bg-white/75 backdrop-blur-md border border-white shadow-[0_18px_50px_rgba(90,60,40,0.12)] p-3 sm:p-4 flex flex-wrap justify-center gap-2">
            <button onClick={() => setActiveCategory(null)} className={chip(!activeCategory)}>
              All
            </button>
            {categories.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)} className={chip(activeCategory === c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        {templates === null ? (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-56 bg-neutral-100 animate-pulse" />
                <div className="p-5 space-y-2">
                  <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse" />
                  <div className="h-5 w-40 bg-neutral-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-10 max-w-xl mx-auto text-center rounded-3xl bg-white/80 border border-white shadow-[0_14px_40px_rgba(90,60,40,0.10)] px-6 py-10">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#fbf1ea] flex items-center justify-center text-3xl" aria-hidden>
              {current.icon}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-neutral-900">{current.label} designs are coming soon</h2>
            <p className="mt-2 text-sm text-neutral-500">
              We&apos;re creating beautiful invitations for {current.hint.toLowerCase()}. Need one now? We&apos;ll design it just for you.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={whatsappLink(`Hi WedVibe! I need an invitation for: ${current.label} (${current.hint}).`)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5b] transition-colors"
              >
                Ask on WhatsApp
              </a>
              <Link href="/custom-invitation" className="px-6 py-2.5 rounded-full border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-white">
                Request a custom design
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((t) => (
              <div
                key={t.id}
                className="group bg-white rounded-2xl overflow-hidden flex flex-col border border-white shadow-[0_10px_30px_rgba(90,60,40,0.08)] hover:shadow-[0_22px_50px_rgba(90,60,40,0.16)] hover:-translate-y-1 transition-all duration-300"
              >
                {t.previewImage && (
                  <div className="relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.previewImage}
                      alt={t.name}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-medium text-neutral-700 shadow-sm">
                      {t.category}
                    </span>
                    {priceInfo(t).percentOff > 0 && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[11px] font-bold tracking-wide shadow-md">
                        {priceInfo(t).percentOff}% OFF
                      </span>
                    )}
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-lg">{t.name}</h3>
                    <PriceTag template={t} className="shrink-0 justify-end text-right" />
                  </div>
                  {t.description && <p className="mt-2 text-sm text-neutral-500 line-clamp-2">{t.description}</p>}
                  <div className="mt-auto pt-4 flex gap-3">
                    <Link
                      href={`/templates/${t.slug}`}
                      className="flex-1 text-center text-sm px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-50"
                    >
                      Preview
                    </Link>
                    {ORDER_MODE === "whatsapp" ? (
                      <OrderOnWhatsAppButton template={t} className="flex-1 text-sm px-3 py-2" />
                    ) : (
                      <Link
                        href={`/templates/${t.slug}`}
                        className="flex-1 text-center text-sm px-4 py-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 hover:shadow-md transition-all"
                      >
                        Use Template
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="relative mt-16 overflow-hidden rounded-3xl bg-[#140d0e] text-white p-8 sm:p-10 text-center">
          <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-rose-700/25 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-amber-600/15 blur-3xl" aria-hidden />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9b36a]/60 to-transparent" aria-hidden />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d9b36a]">Made just for you</p>
            <h2 className="mt-2 text-2xl font-semibold">Didn&apos;t find the perfect design?</h2>
            <p className="text-white/65 mt-2 max-w-md mx-auto">
              Tell us what you have in mind and our design team will create a custom invitation just for you.
            </p>
            <Link
              href="/custom-invitation"
              className="inline-block mt-6 px-7 py-3 rounded-full bg-gradient-to-r from-[#f3d68a] via-[#e2b75a] to-[#c99534] text-[#2b1a0c] text-sm font-semibold hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Request a Custom Invitation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}