"use client";

import { useMemo, useState } from "react";
import type { ShowcaseTemplate } from "./config";

/** Template cards with category filters, "Open Live Design" and "Copy Link" (no prices). */
export function ShowcaseGrid({ templates, siteUrl }: { templates: ShowcaseTemplate[]; siteUrl: string }) {
  const [category, setCategory] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const categories = useMemo(() => [...new Set(templates.map((t) => t.category))], [templates]);
  const visible = templates.filter((t) => !category || t.category === category);

  async function copyLink(slug: string) {
    // Prefer the address the visitor is on (works on preview deployments too).
    const url = `${typeof window !== "undefined" ? window.location.origin : siteUrl}/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
    }
    setCopied(slug);
    setTimeout(() => setCopied((s) => (s === slug ? null : s)), 1800);
  }

  const chip = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm transition-all ${
      active ? "bg-[#5b1530] text-white shadow-md" : "bg-white/80 text-neutral-700 border border-[#ead9cc] hover:border-[#c9a26a] hover:text-[#5b1530]"
    }`;

  return (
    <>
      {categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button onClick={() => setCategory(null)} className={chip(!category)}>
            All designs
          </button>
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={chip(category === c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((t) => (
          <article
            key={t.slug}
            className="group bg-white rounded-3xl overflow-hidden flex flex-col border border-white shadow-[0_12px_34px_rgba(91,21,48,0.08)] hover:shadow-[0_24px_54px_rgba(91,21,48,0.16)] hover:-translate-y-1 transition-all duration-300"
          >
            <a href={`/${t.slug}`} className="relative block overflow-hidden" aria-label={`Open the ${t.name} design`}>
              {t.previewImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.previewImage} alt={t.name} loading="lazy" className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[11px] font-medium text-neutral-700 shadow-sm">
                {t.category}
              </span>
              <span className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <div className="p-5 flex flex-col flex-1">
              <h2 className="font-serif text-xl text-[#5b1530]">{t.name}</h2>
              {t.description && <p className="mt-2 text-sm text-neutral-500 line-clamp-2">{t.description}</p>}
              <div className="mt-auto pt-5 flex gap-2.5">
                <a
                  href={`/${t.slug}`}
                  className="flex-1 text-center text-sm font-medium px-4 py-2.5 rounded-full bg-gradient-to-r from-[#7a1f3d] to-[#b8325e] text-white shadow-sm hover:shadow-md hover:brightness-110 transition-all"
                >
                  Open Live Design
                </a>
                <button
                  onClick={() => copyLink(t.slug)}
                  className={`shrink-0 text-sm font-medium px-4 py-2.5 rounded-full border transition-colors ${
                    copied === t.slug ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-[#ead9cc] text-neutral-700 hover:border-[#c9a26a] hover:bg-[#fdf8f1]"
                  }`}
                >
                  {copied === t.slug ? "Copied ✓" : "Copy Link"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
