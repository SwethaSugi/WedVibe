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
  successfulPayments: number;
  failedPayments: number;
}

const inr = (n: number) => n.toLocaleString("en-IN");

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
