"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

// Simple 20×20 stroke icons for the sidebar.
const ICONS: Record<string, ReactNode> = {
  dashboard: <path d="M3 3h6v8H3zM11 3h6v5h-6zM11 10h6v7h-6zM3 13h6v4H3z" />,
  templates: <path d="M4 3h12v14H4zM7 7h6M7 10h6M7 13h4" />,
  users: <path d="M7 9a3 3 0 100-6 3 3 0 000 6zM2 17c0-3 2.2-5 5-5s5 2 5 5M13.5 9a2.5 2.5 0 100-5M15 12c1.9.4 3 2 3 5" />,
  invitations: <path d="M3 5h14v11H3zM3 5l7 6 7-6" />,
  payments: <path d="M2.5 5h15v10h-15zM2.5 8.5h15M5.5 12.5h3" />,
  requests: <path d="M4 3h12v11H9l-4 3v-3H4zM7 7h6M7 10h4" />,
  logout: <path d="M8 4H4v12h4M12 6l4 4-4 4M16 10H8" />,
  menu: <path d="M3 6h14M3 10h14M3 14h14" />,
  close: <path d="M5 5l10 10M15 5L5 15" />,
};

export function AdminIcon({ name, className = "w-5 h-5" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name]}
    </svg>
  );
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/templates", label: "Templates", icon: "templates" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/invitations", label: "Invitations", icon: "invitations" },
  { href: "/admin/payments", label: "Payments", icon: "payments" },
  { href: "/admin/custom-requests", label: "Custom Requests", icon: "requests" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => setNavOpen(false), [pathname]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const sidebar = (
    <div className="h-full flex flex-col bg-[#140d0e] text-white relative overflow-hidden">
      <div className="absolute -top-24 -left-20 w-64 h-64 rounded-full bg-rose-700/20 blur-3xl" aria-hidden />
      <div className="absolute bottom-0 -right-24 w-64 h-64 rounded-full bg-amber-600/10 blur-3xl" aria-hidden />

      <div className="relative flex items-center gap-3 px-5 pt-6 pb-5 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-rings.jpg"
          alt=""
          className="w-10 h-10 rounded-full object-cover ring-2 ring-[#d9b36a]/50"
          style={{ objectPosition: "42% 58%" }}
        />
        <div className="leading-tight">
          <p className="font-semibold tracking-tight">WedVibe</p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#d9b36a]">Admin Panel</p>
        </div>
      </div>

      <nav className="relative flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                active
                  ? "bg-gradient-to-r from-[#f3d68a] via-[#e2b75a] to-[#c99534] text-[#2b1a0c] font-semibold shadow-[0_8px_24px_rgba(201,149,52,0.25)]"
                  : "text-white/70 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <AdminIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative px-3 pb-5 pt-3 border-t border-white/10">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-white/50 hover:text-white/80">
          View website
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-red-500/15 transition-colors"
        >
          <AdminIcon name="logout" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 min-h-screen bg-[#f7f1ec]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">{sidebar}</aside>

      {/* Mobile sidebar drawer */}
      {navOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 max-w-[80%] h-full shadow-2xl">{sidebar}</div>
          <button className="flex-1 bg-black/40" aria-label="Close menu" onClick={() => setNavOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[#140d0e] text-white">
          <button onClick={() => setNavOpen(true)} aria-label="Open menu" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10">
            <AdminIcon name="menu" />
          </button>
          <p className="font-semibold tracking-tight">
            WedVibe <span className="text-[#d9b36a] text-xs uppercase tracking-[0.2em] ml-1">Admin</span>
          </p>
          <span className="w-9" />
        </div>

        {/* A div, not <main>: the root layout already wraps every page in <main>. */}
        <div
          className="flex-1 px-4 sm:px-8 py-8 relative"
          style={{ backgroundImage: "radial-gradient(rgba(190,150,110,0.18) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        >
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ---------- shared admin UI pieces ----------

export function AdminPageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#b0843a] font-semibold">WedVibe Admin</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 mt-1">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AdminPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#efe5dd] shadow-[0_10px_30px_rgba(90,60,40,0.06)] overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

const PILL_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  SUCCESS: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  INACTIVE: "bg-red-50 text-red-600 ring-red-200",
  DISABLED: "bg-red-50 text-red-600 ring-red-200",
  FAILED: "bg-red-50 text-red-600 ring-red-200",
  DRAFT: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  CREATED: "bg-amber-50 text-amber-700 ring-amber-200",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  NEW: "bg-amber-50 text-amber-700 ring-amber-200",
  CONTACTED: "bg-sky-50 text-sky-700 ring-sky-200",
  REFUNDED: "bg-violet-50 text-violet-700 ring-violet-200",
  // Paid twice for an invitation that was already live — needs a refund.
  DUPLICATE: "bg-orange-50 text-orange-700 ring-orange-300",
  CLOSED: "bg-neutral-100 text-neutral-500 ring-neutral-200",
};

export function StatusPill({ status }: { status: string }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${PILL_STYLES[status] ?? "bg-neutral-100 text-neutral-600 ring-neutral-200"}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

// Table header/body class helpers so every admin table looks the same.
export const adminTable = {
  wrap: "overflow-x-auto",
  table: "w-full text-sm",
  thead: "bg-[#faf5f1] text-[11px] uppercase tracking-[0.12em] text-neutral-500 text-left",
  th: "px-5 py-3.5 font-semibold whitespace-nowrap",
  tr: "border-t border-[#f3ebe5] hover:bg-[#fdfaf7] transition-colors",
  td: "px-5 py-3.5 whitespace-nowrap",
};

export function AdminEmpty({ icon = "✦", title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-[#faf1e6] text-[#b0843a] flex items-center justify-center text-xl">{icon}</div>
      <p className="mt-4 font-medium text-neutral-700">{title}</p>
      {hint && <p className="text-sm text-neutral-400 mt-1">{hint}</p>}
    </div>
  );
}

export function AdminLoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded-xl bg-[#f6efe9] animate-pulse" />
      ))}
    </div>
  );
}

export const adminInput =
  "border border-[#e7dcd3] bg-white rounded-xl px-3.5 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#e2b75a]/40 focus:border-[#d9b36a]";
