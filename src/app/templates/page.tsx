"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { designCountLabel } from "@/lib/design-count";

interface TemplateItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  previewImage: string | null;
}

// Display order for category filters; only categories that currently have templates are shown.
const CATEGORY_ORDER = [
  "Traditional", "Modern", "Minimal", "Royal", "Floral", "South Indian", "North Indian",
  "Muslim Wedding", "Christian Wedding", "Reception", "Engagement", "Haldi", "Mehendi", "Multi-Event",
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((d) => setTemplates(d.templates ?? []))
      .catch(() => setTemplates([]));
  }, []);

  const categories = useMemo(() => {
    const present = new Set((templates ?? []).map((t) => t.category));
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
    const extra = [...present].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
    return [...ordered, ...extra];
  }, [templates]);

  const visible = useMemo(
    () => (templates ?? []).filter((t) => !activeCategory || t.category === activeCategory),
    [templates, activeCategory]
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
            Wedding Invitation Templates
          </h1>
          <p className="mt-3 text-white/85 max-w-xl mx-auto drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
            Pick a design, preview it, then personalise it with your own details.
          </p>
        </div>
      </section>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-16 w-full">
        {categories.length > 1 && (
          <div className="-mt-16 relative z-10 rounded-3xl bg-white/75 backdrop-blur-md border border-white shadow-[0_18px_50px_rgba(90,60,40,0.12)] p-3 sm:p-4 flex flex-wrap justify-center gap-2">
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
          <p className="mt-10 text-center text-neutral-400">New designs are on their way. Please check back soon.</p>
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
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-lg">{t.name}</h3>
                    <p className="font-semibold text-rose-700 shrink-0">₹{t.price}</p>
                  </div>
                  {t.description && <p className="mt-2 text-sm text-neutral-500 line-clamp-2">{t.description}</p>}
                  <div className="mt-auto pt-4 flex gap-3">
                    <Link
                      href={`/templates/${t.slug}`}
                      className="flex-1 text-center text-sm px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-50"
                    >
                      Preview
                    </Link>
                    <Link
                      href={`/templates/${t.slug}`}
                      className="flex-1 text-center text-sm px-4 py-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 hover:shadow-md transition-all"
                    >
                      Use Template
                    </Link>
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