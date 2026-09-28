"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell, AdminPageHeader, AdminIcon, AdminPanel } from "@/components/AdminShell";
import { useAdminFetch } from "@/lib/use-admin-fetch";

interface Stats {
  totalUsers: number;
  totalInvitations: number;
  activeInvitations: number;
  totalTemplates: number;
  totalRevenue: number;
  monthly: Record<string, { revenue: number; count: number }>;
  successfulPayments: number;
  failedPayments: number;
}

const inr = (n: number) => n.toLocaleString("en-IN");

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Current year and month (1-12) in Indian time, matching how the API groups payments.
function nowInIndia() {
  const [y, m] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).format(new Date()).split("-");
  return { year: Number(y), month: Number(m) };
}

/**
 * Monthly revenue: pick a year and a month to see that month's revenue, with a 12-bar
 * chart of the whole year (click a bar to select that month).
 */
function MonthlyRevenue({ monthly }: { monthly: Stats["monthly"] }) {
  const now = useState(nowInIndia)[0];
  const years = Array.from(new Set([now.year, ...Object.keys(monthly).map((k) => Number(k.slice(0, 4)))])).sort((a, b) => b - a);
  const [year, setYear] = useState(now.year);
  const [month, setMonth] = useState(now.month);

  const monthsOfYear = MONTHS.map((name, i) => {
    const entry = monthly[`${year}-${String(i + 1).padStart(2, "0")}`];
    return { name, month: i + 1, revenue: entry?.revenue ?? 0, count: entry?.count ?? 0 };
  });
  const selected = monthsOfYear[month - 1];
  const yearTotal = monthsOfYear.reduce((s, m) => s + m.revenue, 0);
  const yearCount = monthsOfYear.reduce((s, m) => s + m.count, 0);
  const max = Math.max(...monthsOfYear.map((m) => m.revenue), 1);
  const isFuture = (m: number) => year > now.year || (year === now.year && m > now.month);

  const select = "border border-[#e7dcd3] bg-white rounded-xl px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:border-[#d9b36a]";

  return (
    <AdminPanel className="mb-6 p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Monthly Revenue</p>
          <p className="text-sm text-neutral-400 mt-0.5">Successful payments, by month (Indian time)</p>
        </div>
        <div className="flex gap-2">
          <select aria-label="Month" value={month} onChange={(e) => setMonth(Number(e.target.value))} className={select}>
            {MONTHS.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <select aria-label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))} className={select}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-[minmax(0,15rem)_1fr] gap-6 items-end">
        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#fdf8f1] to-white border border-[#f1e6d6] p-4">
            <p className="text-xs text-neutral-500">
              {selected.name} {year}
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900">₹{inr(selected.revenue)}</p>
            <p className="mt-1 text-xs text-neutral-400">
              {isFuture(month) ? "This month hasn't started yet" : `${inr(selected.count)} successful payment${selected.count === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="px-1">
            <p className="text-xs text-neutral-500">Total for {year}</p>
            <p className="mt-0.5 text-lg font-semibold text-neutral-800">₹{inr(yearTotal)}</p>
            <p className="text-xs text-neutral-400">
              {inr(yearCount)} payment{yearCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex items-end gap-1.5 sm:gap-2 h-44 min-w-[420px]">
            {monthsOfYear.map((m) => {
              const active = m.month === month;
              return (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => setMonth(m.month)}
                  title={`${m.name} ${year}: ₹${inr(m.revenue)}`}
                  className="group flex-1 h-full flex flex-col items-center justify-end gap-1.5"
                >
                  <span className={`text-[10px] ${active ? "text-[#b0843a] font-semibold" : "text-transparent group-hover:text-neutral-400"}`}>
                    {m.revenue ? `₹${inr(m.revenue)}` : ""}
                  </span>
                  <span className="relative w-full flex-1 min-h-0 flex items-end">
                    <span
                      className={`block w-full rounded-t-lg transition-all duration-500 ${
                        active ? "bg-gradient-to-t from-[#c99534] to-[#f3d68a]" : "bg-[#efe5dd] group-hover:bg-[#e3d2bf]"
                      }`}
                      style={{ height: `${Math.max((m.revenue / max) * 100, m.revenue ? 4 : 1.5)}%` }}
                    />
                  </span>
                  <span className={`text-[11px] ${active ? "text-neutral-900 font-semibold" : "text-neutral-400"}`}>{m.name.slice(0, 3)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AdminPanel>
  );
}

export default function AdminDashboardPage() {
  const adminFetch = useAdminFetch();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {});
  }, [adminFetch]);

  const attempts = stats ? stats.successfulPayments + stats.failedPayments : 0;
  const successRate = stats && attempts ? Math.round((stats.successfulPayments / attempts) * 100) : null;

  const cards = stats
    ? [
        { label: "Total Users", value: inr(stats.totalUsers), icon: "users", href: "/admin/users", tint: "from-rose-50 to-white text-rose-600" },
        { label: "Invitations", value: inr(stats.totalInvitations), icon: "invitations", href: "/admin/invitations", tint: "from-amber-50 to-white text-amber-600" },
        { label: "Live Invitations", value: inr(stats.activeInvitations), icon: "invitations", href: "/admin/invitations", tint: "from-emerald-50 to-white text-emerald-600" },
        { label: "Active Templates", value: inr(stats.totalTemplates), icon: "templates", href: "/admin/templates", tint: "from-violet-50 to-white text-violet-600" },
        { label: "Successful Payments", value: inr(stats.successfulPayments), icon: "payments", href: "/admin/payments", tint: "from-emerald-50 to-white text-emerald-600" },
        { label: "Failed Payments", value: inr(stats.failedPayments), icon: "payments", href: "/admin/payments", tint: "from-red-50 to-white text-red-500" },
      ]
    : [];

  return (
    <AdminShell>
      <AdminPageHeader title="Dashboard" subtitle="An overview of your wedding invitation platform." />

      {!stats ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/70 border border-[#efe5dd] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Revenue hero */}
          <div className="relative overflow-hidden rounded-3xl bg-[#140d0e] text-white p-7 sm:p-8 mb-6 shadow-[0_20px_50px_rgba(20,13,14,0.25)]">
            <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl" aria-hidden />
            <div className="absolute -bottom-24 left-10 w-72 h-72 rounded-full bg-rose-700/25 blur-3xl" aria-hidden />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9b36a]/60 to-transparent" aria-hidden />
            <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#d9b36a]">Total Revenue</p>
                <p className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight">₹{inr(stats.totalRevenue)}</p>
                <p className="mt-2 text-sm text-white/60">
                  From {inr(stats.successfulPayments)} successful payment{stats.successfulPayments === 1 ? "" : "s"}
                </p>
              </div>
              <div className="md:w-72">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Payment success rate</span>
                  <span className="font-semibold text-white">{successRate === null ? "—" : `${successRate}%`}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#f3d68a] to-[#c99534] transition-all duration-700"
                    style={{ width: `${successRate ?? 0}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-white/45">{attempts ? `${inr(attempts)} completed payment attempts` : "No payment attempts yet"}</p>
              </div>
            </div>
          </div>

          <MonthlyRevenue monthly={stats.monthly ?? {}} />

          {/* Stat cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="group relative bg-white rounded-2xl border border-[#efe5dd] p-5 shadow-[0_10px_30px_rgba(90,60,40,0.06)] hover:shadow-[0_18px_40px_rgba(90,60,40,0.12)] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">{c.label}</p>
                    <p className="text-3xl font-semibold tracking-tight text-neutral-900 mt-2">{c.value}</p>
                  </div>
                  <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.tint} border border-[#f1e8e1] flex items-center justify-center`}>
                    <AdminIcon name={c.icon as "users"} />
                  </span>
                </div>
                <p className="mt-4 text-xs text-neutral-400 group-hover:text-[#b0843a] transition-colors">View details</p>
              </Link>
            ))}
          </div>

          {/* Quick actions */}
          <AdminPanel className="mt-6 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-500 mb-3">Quick actions</p>
            <div className="flex flex-wrap gap-2">
              {[
                { href: "/admin/templates", label: "Manage template prices" },
                { href: "/admin/custom-requests", label: "Review custom requests" },
                { href: "/admin/payments", label: "Check payments" },
                { href: "/templates", label: "Open the marketplace", external: true },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  target={a.external ? "_blank" : undefined}
                  className="px-4 py-2 rounded-full text-sm border border-[#e7dcd3] text-neutral-700 hover:border-[#d9b36a] hover:bg-[#fdf8f1] transition-colors"
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </AdminPanel>
        </>
      )}
    </AdminShell>
  );
}
