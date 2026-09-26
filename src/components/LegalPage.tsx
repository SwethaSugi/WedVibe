import Link from "next/link";
import type { ReactNode } from "react";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

const POLICY_LINKS = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund & Cancellation" },
  { href: "/contact", label: "Contact Us" },
];

/** Shared layout for the legal/policy pages: banner, table of contents and numbered sections. */
export function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  current,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  updated: string;
  current: string;
  sections: LegalSection[];
}) {
  return (
    <div className="relative w-full flex-1 bg-gradient-to-b from-[#fbf6f2] via-[#fdf9f6] to-[#f7ede7]">
      {/* Banner */}
      <section className="relative overflow-hidden bg-[#140d0e] text-white">
        <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-rose-700/25 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 right-0 w-[28rem] h-[28rem] rounded-full bg-amber-600/15 blur-3xl" aria-hidden />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <p className="text-xs uppercase tracking-[0.35em] text-[#d9b36a]">{eyebrow}</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-white/65 max-w-2xl">{intro}</p>
          <p className="mt-5 text-xs text-white/45">Last updated: {updated}</p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d9b36a]/60 to-transparent" aria-hidden />
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[220px_1fr] gap-8 items-start">
        {/* Table of contents */}
        <nav className="lg:sticky lg:top-24 bg-white/80 backdrop-blur rounded-2xl border border-[#efe5dd] p-5 text-sm">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#b0843a] font-semibold">On this page</p>
          <ol className="mt-3 space-y-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-neutral-600 hover:text-rose-700 transition-colors">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-5 pt-4 border-t border-[#f1e8e1] space-y-2">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#b0843a] font-semibold">Policies</p>
            {POLICY_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block ${l.href === current ? "text-rose-700 font-medium" : "text-neutral-600 hover:text-rose-700"} transition-colors`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <article className="bg-white rounded-3xl border border-[#efe5dd] shadow-[0_18px_50px_rgba(90,60,40,0.08)] p-6 sm:p-10 space-y-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 flex items-baseline gap-3">
                <span className="text-sm font-semibold text-[#b0843a] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-neutral-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-neutral-800 [&_a]:text-rose-700 [&_a:hover]:underline">
                {s.body}
              </div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
