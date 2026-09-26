"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { InvitationData } from "@/lib/invitation-types";
import type { EditInfo } from "@/lib/edit-policy";
import { buildInviteMessage } from "@/lib/invite-message";

interface InvitationSummary {
  id: string;
  slug: string;
  status: string;
  templateName: string;
  templatePreviewImage: string | null;
  price: number;
  currency: string;
  views: number;
  editInfo: EditInfo;
  data: InvitationData;
  updatedAt: string;
}

const STATUS: Record<string, { label: string; className: string; live?: boolean }> = {
  DRAFT: { label: "Draft", className: "bg-white/85 text-neutral-700" },
  PAYMENT_PENDING: { label: "Payment Pending", className: "bg-amber-100/95 text-amber-800" },
  PAID: { label: "Paid", className: "bg-amber-100/95 text-amber-800" },
  PUBLISHED: { label: "Live", className: "bg-emerald-500/95 text-white", live: true },
  ACTIVE: { label: "Live", className: "bg-emerald-500/95 text-white", live: true },
  INACTIVE: { label: "Inactive", className: "bg-red-500/90 text-white" },
};

type Filter = "all" | "live" | "drafts" | "pending";
const isLiveStatus = (s: string) => s === "ACTIVE" || s === "PUBLISHED";

// Days from today until the wedding (null when no date). Local-midnight based, so "today" is 0.
function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  const wedding = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((wedding.getTime() - today.getTime()) / 86400000);
}

function countdownLabel(days: number | null) {
  if (days === null) return null;
  if (days > 1) return `in ${days} days`;
  if (days === 1) return "Tomorrow!";
  if (days === 0) return "Today! 🎉";
  return "Celebrated ♥";
}

// Animates a number from 0 up to `value` once it's known.
function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    // No animation when there's nothing to count, the tab is in the background (animation
    // frames are paused there) or the visitor prefers reduced motion — just show the number.
    if (!value || document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Safety net: always land on the real number even if frames stop (e.g. tab hidden mid-count).
    const done = setTimeout(() => setShown(value), 1200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [value]);
  return <>{shown.toLocaleString("en-IN")}</>;
}

const ICON_PATHS = {
  total: "M3 5h14v11H3zM3 5l7 6 7-6",
  live: "M10 17s-6-3.6-6-8.5A3.5 3.5 0 0110 6a3.5 3.5 0 016 2.5C16 13.4 10 17 10 17z",
  drafts: "M4 16l3-1 8-8-2-2-8 8-1 3zM12 5l2 2",
  views: "M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10zM10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
};

function Icon({ d, className = "w-5 h-5" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<InvitationSummary[] | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((d) => {
        if (!d.user) {
          router.push("/login?next=/dashboard");
          return;
        }
        setUserName(d.user.name ?? null);
        return fetch("/api/invitations")
          .then((res) => res.json())
          .then((data) => setInvitations(data.invitations ?? []));
      });
  }, [router]);

  async function removeDraft(inv: InvitationSummary) {
    const label = inv.data.groomName && inv.data.brideName ? `${inv.data.groomName} & ${inv.data.brideName}` : "this draft";
    if (!window.confirm(`Remove ${label}?\n\nThis draft will be permanently deleted. This can't be undone.`)) return;

    const res = await fetch(`/api/invitations/${inv.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? "Unable to remove this draft. Please try again.");
      return;
    }
    setInvitations((prev) => prev?.filter((i) => i.id !== inv.id) ?? prev);
  }

  async function completePayment(inv: InvitationSummary) {
    const res = await fetch(`/api/invitations/${inv.id}/generate`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.orderId) {
      window.alert(data.error ?? "Unable to open payment. Please try again from the editor.");
      return;
    }
    router.push(`/payment/${data.orderId}`);
  }

  function copyLink(inv: InvitationSummary) {
    navigator.clipboard.writeText(buildInviteMessage(inv.data, `${window.location.origin}/invite/${inv.slug}`));
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId((id) => (id === inv.id ? null : id)), 1800);
  }

  const counts = useMemo(() => {
    const list = invitations ?? [];
    return {
      all: list.length,
      live: list.filter((i) => isLiveStatus(i.status)).length,
      drafts: list.filter((i) => i.status === "DRAFT").length,
      pending: list.filter((i) => i.status === "PAYMENT_PENDING").length,
      views: list.reduce((sum, i) => sum + (i.views ?? 0), 0),
    };
  }, [invitations]);

  const visible = useMemo(
    () =>
      (invitations ?? []).filter((i) =>
        filter === "all"
          ? true
          : filter === "live"
            ? isLiveStatus(i.status)
            : filter === "drafts"
              ? i.status === "DRAFT"
              : i.status === "PAYMENT_PENDING"
      ),
    [invitations, filter]
  );

  const firstName = userName?.trim().split(" ")[0];

  return (
    <div className="relative w-full flex-1 bg-gradient-to-b from-[#fbf6f2] via-[#fdf9f6] to-[#f7ede7] overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        .font-vibes { font-family: 'Great Vibes', cursive; }

        @keyframes db-rise { from { opacity: 0; transform: translateY(18px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes db-heart {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.8; }
          100% { transform: translateY(-260px) rotate(25deg); opacity: 0; }
        }
        @keyframes db-shine { from { background-position: -200% 0; } to { background-position: 200% 0; } }
        @keyframes db-grow { from { width: 0; } }

        .db-rise { animation: db-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .db-heart { animation: db-heart linear infinite; }
        .db-shine {
          background: linear-gradient(90deg, #fff 0%, #fff 40%, #f3d68a 50%, #fff 60%, #fff 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: db-shine 5s linear infinite;
        }
        .db-grow { animation: db-grow 1s cubic-bezier(0.22, 1, 0.36, 1) both; }

        @media (prefers-reduced-motion: reduce) {
          .db-rise, .db-heart, .db-shine, .db-grow { animation: none !important; }
        }
      `}</style>

      <div className="pointer-events-none absolute top-[520px] -left-40 w-[28rem] h-[28rem] rounded-full bg-rose-200/35 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute top-[900px] -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-200/30 blur-3xl" aria-hidden />

      {/* ===== Hero banner (Pexels #20172658, free licence) ===== */}
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/defaults/featured-rings-silver.jpg" alt="" aria-hidden className="wv-hero-drift absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fbf6f2] to-transparent" aria-hidden />
        {[
          { left: "8%", delay: "0s", dur: "9s", size: "text-lg" },
          { left: "22%", delay: "3s", dur: "11s", size: "text-sm" },
          { left: "70%", delay: "1.5s", dur: "10s", size: "text-base" },
          { left: "88%", delay: "5s", dur: "12s", size: "text-sm" },
        ].map((h, i) => (
          <span
            key={i}
            className={`db-heart absolute bottom-10 text-rose-300/80 ${h.size}`}
            style={{ left: h.left, animationDelay: h.delay, animationDuration: h.dur }}
            aria-hidden
          >
            ♥
          </span>
        ))}

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-28 sm:pt-16 sm:pb-32 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="db-rise">
            <p className="text-xs uppercase tracking-[0.35em] text-[#f3d68a]">My Invitations</p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              {firstName ? (
                <>
                  Welcome back, <span className="db-shine">{firstName}</span> ✨
                </>
              ) : (
                <span className="db-shine">Your Wedding Invitations</span>
              )}
            </h1>
            <p className="mt-3 text-white/80 max-w-xl">Create, edit and share your wedding invitations — all in one beautiful place.</p>
          </div>
          <Link
            href="/templates"
            className="db-rise shrink-0 self-start md:self-auto inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#f3d68a] via-[#e2b75a] to-[#c99534] text-[#2b1a0c] font-semibold shadow-[0_10px_30px_rgba(201,149,52,0.35)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            style={{ animationDelay: "120ms" }}
          >
            <span className="text-lg leading-none">＋</span> Create New Invitation
          </Link>
        </div>
      </section>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-20 -mt-16">
        {/* ===== Stats ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Invitations", value: counts.all, icon: ICON_PATHS.total, tint: "text-rose-600 bg-rose-50" },
            { label: "Live", value: counts.live, icon: ICON_PATHS.live, tint: "text-emerald-600 bg-emerald-50" },
            { label: "Drafts", value: counts.drafts + counts.pending, icon: ICON_PATHS.drafts, tint: "text-amber-600 bg-amber-50" },
            { label: "Guest Views", value: counts.views, icon: ICON_PATHS.views, tint: "text-violet-600 bg-violet-50" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="db-rise bg-white/85 backdrop-blur rounded-2xl border border-white shadow-[0_14px_40px_rgba(90,60,40,0.10)] p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
              style={{ animationDelay: `${150 + i * 80}ms` }}
            >
              <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${s.tint}`}>
                <Icon d={s.icon} />
              </span>
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 tabular-nums">
                  {invitations === null ? "—" : <CountUp value={s.value} />}
                </p>
                <p className="text-xs uppercase tracking-[0.15em] text-neutral-500 truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Filter tabs ===== */}
        {invitations && invitations.length > 0 && (
          <div className="db-rise mt-8 inline-flex flex-wrap gap-1 p-1.5 rounded-full bg-white/80 backdrop-blur border border-[#efe5dd] shadow-sm" style={{ animationDelay: "450ms" }}>
            {(
              [
                ["all", "All", counts.all],
                ["live", "Live", counts.live],
                ["drafts", "Drafts", counts.drafts],
                ["pending", "Pending", counts.pending],
              ] as [Filter, string, number][]
            ).map(([key, label, n]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === key ? "bg-[#140d0e] text-white shadow-md" : "text-neutral-600 hover:bg-[#fdf5ec]"
                }`}
              >
                {label}
                <span className={`ml-1.5 text-xs ${filter === key ? "text-[#f3d68a]" : "text-neutral-400"}`}>{n}</span>
              </button>
            ))}
          </div>
        )}

        {/* ===== Content ===== */}
        {invitations === null ? (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-white shadow-sm">
                <div className="h-48 bg-[#f3ebe4] animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-6 w-40 bg-[#f3ebe4] rounded animate-pulse" />
                  <div className="h-4 w-28 bg-[#f6efe9] rounded animate-pulse" />
                  <div className="h-9 w-full bg-[#f6efe9] rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : invitations.length === 0 ? (
          <div className="db-rise mt-10 relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur border border-white shadow-[0_18px_50px_rgba(90,60,40,0.10)] px-6 py-16 text-center">
            <div className="relative mx-auto w-20 h-20">
              <span className="absolute inset-0 rounded-full bg-rose-200/60 animate-ping" aria-hidden />
              <span className="relative w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center text-3xl shadow-lg">
                💌
              </span>
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-neutral-900">Your love story starts here</h2>
            <p className="mt-2 text-neutral-500 max-w-md mx-auto">
              You haven&apos;t created any invitations yet. Pick a design you love and make it yours in minutes.
            </p>
            <Link
              href="/templates"
              className="inline-block mt-6 px-7 py-3 rounded-full bg-[#140d0e] text-white font-semibold hover:bg-black hover:-translate-y-0.5 transition-all"
            >
              Browse Templates
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <p className="db-rise mt-10 text-center text-neutral-500">No invitations in this list yet.</p>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((inv, idx) => {
              const status = STATUS[inv.status] ?? { label: inv.status, className: "bg-white/85 text-neutral-700" };
              const live = isLiveStatus(inv.status);
              const hasNames = inv.data.groomName || inv.data.brideName;
              const days = daysUntil(inv.data.weddingDate);
              const countdown = countdownLabel(days);
              const editsLeft = inv.editInfo.editsAllowed - inv.editInfo.editsUsed;
              const dateText = inv.data.weddingDate
                ? new Date(inv.data.weddingDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : null;

              return (
                <article
                  key={inv.id}
                  className="db-rise group relative bg-white rounded-3xl overflow-hidden border border-white shadow-[0_12px_36px_rgba(90,60,40,0.10)] hover:shadow-[0_26px_60px_rgba(176,132,58,0.25)] hover:-translate-y-1.5 transition-all duration-500"
                  style={{ animationDelay: `${500 + idx * 90}ms` }}
                >
                  {/* gold ring on hover */}
                  <span className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-[#e2b75a]/0 group-hover:ring-[#e2b75a]/60 transition-all duration-500 z-10" aria-hidden />

                  {/* Cover */}
                  <div className="relative h-48 bg-[#140d0e] overflow-hidden">
                    {inv.templatePreviewImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={inv.templatePreviewImage}
                        alt={inv.templateName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">{inv.templateName}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <span className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur shadow-sm ${status.className}`}>
                      {status.live && (
                        <span className="relative flex w-2 h-2">
                          <span className="absolute inset-0 rounded-full bg-white animate-ping" />
                          <span className="relative w-2 h-2 rounded-full bg-white" />
                        </span>
                      )}
                      {status.label}
                    </span>
                    {countdown && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium bg-black/45 text-white backdrop-blur">
                        {countdown}
                      </span>
                    )}
                    <p className="absolute bottom-3 left-4 text-[11px] uppercase tracking-[0.2em] text-white/85">{inv.templateName}</p>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="font-vibes text-[2rem] leading-tight text-[#7d3f39] truncate">
                      {hasNames ? (
                        <>
                          {inv.data.groomName || "Groom"} <span className="text-[#c99534]">&amp;</span> {inv.data.brideName || "Bride"}
                        </>
                      ) : (
                        <span className="font-sans text-lg text-neutral-400 font-medium">Untitled draft</span>
                      )}
                    </h3>
                    {(dateText || inv.data.venueName) && (
                      <p className="mt-1 text-sm text-neutral-500 truncate">
                        {dateText && <>📅 {dateText}</>}
                        {dateText && inv.data.venueName && <span className="mx-1.5 text-neutral-300">·</span>}
                        {inv.data.venueName && <>📍 {inv.data.venueName}</>}
                      </p>
                    )}

                    {live && (
                      <div className="mt-4 rounded-2xl bg-[#fcf8f4] border border-[#f3ebe5] px-4 py-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1.5 text-neutral-600">
                            <Icon d={ICON_PATHS.views} className="w-4 h-4 text-violet-500" />
                            <strong className="text-neutral-800">{inv.views}</strong> guest view{inv.views === 1 ? "" : "s"}
                          </span>
                          <span className="text-neutral-500">
                            {inv.editInfo.canEdit ? `${editsLeft} of ${inv.editInfo.editsAllowed} edits left` : "Editing closed"}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-[#efe5dd] overflow-hidden">
                          <div
                            className="db-grow h-full rounded-full bg-gradient-to-r from-[#f3d68a] to-[#c99534]"
                            style={{ width: `${inv.editInfo.canEdit ? (editsLeft / inv.editInfo.editsAllowed) * 100 : 0}%`, animationDelay: `${800 + idx * 90}ms` }}
                          />
                        </div>
                        {inv.editInfo.canEdit && inv.editInfo.editWindowEndsAt && (
                          <p className="mt-1.5 text-[11px] text-neutral-400">
                            Editable until {new Date(inv.editInfo.editWindowEndsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      {inv.editInfo.canEdit ? (
                        <Link
                          href={`/editor/${inv.id}`}
                          className="text-sm font-medium px-4 py-2 rounded-full bg-[#140d0e] text-white hover:bg-black transition-colors"
                        >
                          ✎ Edit
                        </Link>
                      ) : (
                        <span
                          title={inv.editInfo.reason ?? undefined}
                          className="text-sm font-medium px-4 py-2 rounded-full bg-neutral-100 text-neutral-400 cursor-not-allowed"
                        >
                          Editing closed
                        </span>
                      )}
                      {live && (
                        <>
                          <Link
                            href={`/invite/${inv.slug}`}
                            target="_blank"
                            className="text-sm font-medium px-4 py-2 rounded-full border border-[#e7dcd3] text-neutral-700 hover:border-[#d9b36a] hover:bg-[#fdf8f1] transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => copyLink(inv)}
                            className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${
                              copiedId === inv.id
                                ? "bg-emerald-500 text-white scale-105"
                                : "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:shadow-md"
                            }`}
                          >
                            {copiedId === inv.id ? "Invite copied ✓" : "Copy Link"}
                          </button>
                        </>
                      )}
                      {inv.status === "PAYMENT_PENDING" && (
                        <button
                          onClick={() => completePayment(inv)}
                          className="text-sm font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-[#f3d68a] via-[#e2b75a] to-[#c99534] text-[#2b1a0c] hover:brightness-110 transition"
                        >
                          Complete Payment
                        </button>
                      )}
                      {inv.status === "DRAFT" && (
                        <button
                          onClick={() => removeDraft(inv)}
                          className="text-sm font-medium px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
