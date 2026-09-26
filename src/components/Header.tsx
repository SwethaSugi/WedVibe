"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/templates", label: "Templates" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/custom-invitation", label: "Custom Design" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="relative group py-1 text-neutral-600 hover:text-neutral-900 transition-colors">
      {label}
      <span className="absolute left-0 -bottom-0.5 h-px w-full bg-rose-500 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}

export function Header() {
  const [user, setUser] = useState<{ mobile: string; name?: string | null } | null | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
    setMenuOpen(false);
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 4);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const initial = user ? (user.name?.trim() || user.mobile.slice(-2)).slice(0, 1) : "";
  // "+919876543210" -> "+91 98765 43210"
  const displayMobile = user
    ? /^\+91\d{10}$/.test(user.mobile)
      ? `+91 ${user.mobile.slice(3, 8)} ${user.mobile.slice(8)}`
      : user.mobile
    : "";

  // Public invitation pages are standalone, shareable pages — they should not carry the
  // main site chrome (logo, nav, login/dashboard links).
  // Admin pages have their own chrome (AdminShell) and a separate admin session.
  if (pathname?.startsWith("/invite/") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-40 bg-white/85 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.06)] border-b border-neutral-200/70" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="wv-logo-glow rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-rings.jpg"
              alt="WedVibe"
              className="w-9 h-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              style={{ objectPosition: "42% 58%" }}
            />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight text-neutral-900">WedVibe</span>
            <span className="hidden sm:block text-[11px] text-neutral-500 -mt-0.5">Modern wedding invitation platform</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user === undefined ? (
            <div className="w-24 h-8 rounded-full bg-neutral-100 animate-pulse" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-2 text-sm font-medium pl-1 pr-3 py-1 rounded-full border transition-all ${
                  menuOpen ? "border-[#d9b36a] bg-[#fdf8f1] shadow-sm" : "border-neutral-200 hover:border-[#d9b36a]/70 hover:bg-[#fdfaf6] hover:shadow-sm"
                }`}
              >
                <span className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-br from-[#f3d68a] to-[#c99534]">
                  <span className="w-full h-full rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center text-xs uppercase font-semibold">
                    {initial}
                  </span>
                </span>
                <span className="hidden sm:inline text-neutral-800 max-w-[9rem] truncate">{user.name ?? displayMobile}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  className={`text-neutral-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="wv-dropdown-in absolute right-0 mt-3 w-72 bg-white rounded-2xl border border-[#efe5dd] shadow-[0_24px_60px_rgba(20,13,14,0.18)] overflow-hidden text-sm"
                >
                  {/* Profile card */}
                  <div className="relative overflow-hidden bg-[#140d0e] text-white px-5 py-5">
                    <div className="absolute -top-12 -right-10 w-40 h-40 rounded-full bg-rose-700/30 blur-2xl" aria-hidden />
                    <div className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-amber-600/20 blur-2xl" aria-hidden />
                    <div className="relative flex items-center gap-3.5">
                      <span className="w-12 h-12 shrink-0 rounded-full p-[2px] bg-gradient-to-br from-[#f3d68a] to-[#c99534]">
                        <span className="w-full h-full rounded-full bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-lg uppercase font-semibold">
                          {initial}
                        </span>
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-[#d9b36a]">Signed in as</p>
                        <p className="font-semibold text-base truncate">{user.name ?? "WedVibe member"}</p>
                        <p className="text-xs text-white/60">{displayMobile}</p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#d9b36a]/60 to-transparent" aria-hidden />
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    {[
                      { href: "/dashboard", label: "My Invitations", hint: "View, edit & share", icon: "M3 5h14v11H3zM3 5l7 6 7-6" },
                      { href: "/templates", label: "Create New Invitation", hint: "Browse templates", icon: "M10 4v12M4 10h12" },
                      { href: "/custom-invitation", label: "Custom Design", hint: "Made just for you", icon: "M4 16l3-1 8-8-2-2-8 8-1 3zM12 5l2 2" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#fdf8f1] transition-colors"
                      >
                        <span className="w-9 h-9 shrink-0 rounded-xl bg-[#faf3ea] text-[#b0843a] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#f3d68a] group-hover:to-[#c99534] group-hover:text-[#2b1a0c] transition-colors">
                          <svg viewBox="0 0 20 20" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d={item.icon} />
                          </svg>
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium text-neutral-800">{item.label}</span>
                          <span className="block text-xs text-neutral-400">{item.hint}</span>
                        </span>
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-[#f3ebe5] p-2">
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="w-9 h-9 shrink-0 rounded-xl bg-red-50 flex items-center justify-center">
                        <svg viewBox="0 0 20 20" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M8 4H4v12h4M12 6l4 4-4 4M16 10H8" />
                        </svg>
                      </span>
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                Login
              </Link>
              <Link
                href="/templates"
                className="hidden sm:inline-block text-sm font-medium px-4 py-2 rounded-full bg-rose-600 text-white shadow-sm hover:bg-rose-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Create Invitation
              </Link>
            </>
          )}
          <button
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileNavOpen}
            className="md:hidden w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {mobileNavOpen ? <path d="M3 3l10 10M13 3L3 13" /> : <path d="M2 4h12M2 8h12M2 12h12" />}
            </svg>
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <nav className="md:hidden wv-dropdown-in border-t border-neutral-200 bg-white px-4 py-3 flex flex-col">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileNavOpen(false)}
              className="py-2.5 text-sm text-neutral-700 hover:text-rose-600 border-b border-neutral-100 last:border-0"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <Link
              href="/templates"
              onClick={() => setMobileNavOpen(false)}
              className="mt-3 text-center text-sm font-medium px-4 py-2.5 rounded-full bg-rose-600 text-white hover:bg-rose-700"
            >
              Create Invitation
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
