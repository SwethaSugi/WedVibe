"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { whatsappLink } from "@/lib/site-config";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/templates", label: "All Templates" },
      { href: "/#how-it-works", label: "How It Works" },
      { href: "/#pricing", label: "Pricing" },
    ],
  },
  {
    title: "Your Account",
    links: [
      { href: "/dashboard", label: "My Invitations" },
      { href: "/login", label: "Login" },
    ],
  },
  {
    title: "Need Something Special?",
    links: [
      { href: "/custom-invitation", label: "Request a Custom Design" },
      { href: whatsappLink(), label: "Chat with us on WhatsApp", external: true },
    ],
  },
  {
    title: "Help & Policies",
    links: [
      { href: "/contact", label: "Contact Us" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/refund-policy", label: "Refund & Cancellation" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();

  // Same rule as the Header: invitation and admin pages carry no site chrome. The editor
  // is a full-height workspace, so it skips the footer too.
  if (pathname?.startsWith("/invite/") || pathname?.startsWith("/admin") || pathname?.startsWith("/editor/")) {
    return null;
  }

  return (
    <footer className="relative overflow-hidden bg-[#140d0e] text-white">
      {/* Soft glows + gold hairline for a premium finish */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-rose-700/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-40 right-0 w-[28rem] h-[28rem] rounded-full bg-amber-600/10 blur-3xl" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9b36a]/60 to-transparent" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Call to action */}
        <div className="py-14 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 text-center md:text-left">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#d9b36a]">Your story, beautifully told</p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mt-2">Ready to create your invitation?</h2>
            <p className="text-white/60 mt-2 text-sm">Pick a design, add your details and share it with everyone in minutes.</p>
          </div>
          <Link
            href="/templates"
            className="shrink-0 px-7 py-3 rounded-full bg-gradient-to-r from-[#f3d68a] via-[#e2b75a] to-[#c99534] text-[#2b1a0c] font-semibold shadow-[0_10px_30px_rgba(201,149,52,0.3)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Start Creating
          </Link>
        </div>

        {/* Brand + link columns */}
        <div className="py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr_1.1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-rings.jpg"
                alt=""
                className="w-11 h-11 rounded-full object-cover ring-2 ring-[#d9b36a]/50"
                style={{ objectPosition: "42% 58%" }}
              />
              <span>
                <span className="block text-xl font-semibold tracking-tight">WedVibe</span>
                <span className="block text-[11px] text-white/50 -mt-0.5">Modern wedding invitation platform</span>
              </span>
            </Link>
            <p className="text-sm text-white/60 mt-5 max-w-xs leading-relaxed">
              Beautiful digital wedding invitations, shared with everyone through one simple link.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs uppercase tracking-[0.25em] text-[#d9b36a]">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {"external" in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-[#25D366] transition-colors"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-sm text-white/75 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/45">
          <p>© {new Date().getFullYear()} WedVibe. All rights reserved.</p>
          <p className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link href="/terms" className="hover:text-white/80">Terms</Link>
            <Link href="/privacy" className="hover:text-white/80">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-white/80">Refunds</Link>
            <Link href="/contact" className="hover:text-white/80">Contact</Link>
          </p>
          <p>
            Made with <span className="text-rose-400">♥</span> for couples everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
