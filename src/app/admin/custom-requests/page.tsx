"use client";

import { useEffect, useState } from "react";
import { AdminShell, AdminPageHeader, AdminPanel, StatusPill, AdminEmpty, AdminLoadingRows, adminInput } from "@/components/AdminShell";
import { useAdminFetch } from "@/lib/use-admin-fetch";

interface CustomRequestItem {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  requirements: string;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "CLOSED", label: "Closed" },
];

export default function AdminCustomRequestsPage() {
  const adminFetch = useAdminFetch();
  const [requests, setRequests] = useState<CustomRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    adminFetch("/api/admin/custom-requests")
      .then((res) => res.json())
      .then((d) => setRequests(d.requests ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function updateStatus(id: string, status: string) {
    await adminFetch(`/api/admin/custom-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const newCount = requests.filter((r) => r.status === "NEW").length;

  return (
    <AdminShell>
      <AdminPageHeader
        title="Custom Requests"
        subtitle={loading ? "Loading…" : `${requests.length} request${requests.length === 1 ? "" : "s"}${newCount ? ` · ${newCount} new` : ""}`}
      />
      {loading ? (
        <AdminPanel>
          <AdminLoadingRows rows={3} />
        </AdminPanel>
      ) : requests.length === 0 ? (
        <AdminPanel>
          <AdminEmpty icon="🎨" title="No custom invitation requests yet" hint="Requests from the Custom Design page will appear here." />
        </AdminPanel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((r) => {
            const digits = r.mobile.replace(/\D/g, "");
            return (
              <AdminPanel key={r.id} className={`p-5 ${r.status === "NEW" ? "ring-1 ring-[#e2b75a]/50" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center font-semibold uppercase">
                      {r.name.trim().charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900 truncate">{r.name}</p>
                      <p className="text-xs text-neutral-500 truncate">
                        {r.mobile}
                        {r.email ? ` · ${r.email}` : ""}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                </div>

                <p className="text-sm text-neutral-700 mt-4 leading-relaxed whitespace-pre-line bg-[#fcf8f5] border border-[#f3ebe5] rounded-xl p-3.5">
                  {r.requirements}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-neutral-400">
                    {new Date(r.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                  <div className="flex items-center gap-2">
                    {digits && (
                      <a
                        href={`https://wa.me/${digits}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      >
                        WhatsApp
                      </a>
                    )}
                    <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className={`${adminInput} py-1.5 text-xs`}>
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </AdminPanel>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
