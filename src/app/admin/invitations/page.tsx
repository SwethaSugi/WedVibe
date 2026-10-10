"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell, AdminPageHeader, AdminPanel, StatusPill, AdminEmpty, AdminLoadingRows, adminTable, adminInput } from "@/components/AdminShell";
import { useAdminFetch } from "@/lib/use-admin-fetch";

interface AdminInvitation {
  id: string;
  invitationCode: string;
  slug: string;
  userMobile: string;
  customerName: string | null;
  groomName: string;
  brideName: string;
  templateName: string;
  price: number;
  status: string;
  hasDetailsLink: boolean;
  detailsSubmittedAt: string | null;
  createdAt: string;
}

interface TemplateOption {
  id: string;
  name: string;
  status: string;
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "live", label: "Live" },
  { key: "inactive", label: "Inactive" },
] as const;
type Filter = (typeof FILTERS)[number]["key"];

const isLive = (s: string) => s === "ACTIVE" || s === "PUBLISHED";
const isDraft = (s: string) => s === "DRAFT" || s === "PAYMENT_PENDING";

export default function AdminInvitationsPage() {
  const adminFetch = useAdminFetch();
  const router = useRouter();
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [showNew, setShowNew] = useState(false);

  function load() {
    adminFetch("/api/admin/invitations")
      .then((res) => res.json())
      .then((d) => setInvitations(d.invitations ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = {
    all: invitations.length,
    draft: invitations.filter((i) => isDraft(i.status)).length,
    live: invitations.filter((i) => isLive(i.status)).length,
    inactive: invitations.filter((i) => i.status === "INACTIVE").length,
  };
  const filtered = invitations
    .filter((i) => filter === "all" || (filter === "draft" ? isDraft(i.status) : filter === "live" ? isLive(i.status) : i.status === "INACTIVE"))
    .filter((inv) =>
      `${inv.groomName} ${inv.brideName} ${inv.userMobile} ${inv.customerName ?? ""} ${inv.invitationCode}`.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <AdminShell>
      <AdminPageHeader
        title="Invitations"
        subtitle={loading ? "Loading…" : `${counts.all} invitations · ${counts.live} live · ${counts.draft} in progress`}
        actions={
          <div className="flex flex-wrap gap-2">
            <input placeholder="Search couple, customer, code…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${adminInput} w-56`} />
            <button
              onClick={() => setShowNew(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-sm hover:brightness-110"
            >
              + New invitation
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm transition-colors ${
              filter === f.key ? "bg-neutral-900 text-white" : "bg-white border border-[#e7dcd3] text-neutral-700 hover:bg-[#fdf8f1]"
            }`}
          >
            {f.label} <span className="opacity-60">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      <AdminPanel>
        {loading ? (
          <AdminLoadingRows />
        ) : filtered.length === 0 ? (
          <AdminEmpty
            icon="💌"
            title={search ? "No invitations match your search" : "No invitations here yet"}
            hint={!search && filter === "all" ? "When a customer orders on WhatsApp, press “New invitation” to build theirs." : undefined}
          />
        ) : (
          <div className={adminTable.wrap}>
            <table className={adminTable.table}>
              <thead className={adminTable.thead}>
                <tr>
                  <th className={adminTable.th}>Couple</th>
                  <th className={adminTable.th}>Customer</th>
                  <th className={adminTable.th}>Template</th>
                  <th className={adminTable.th}>Status</th>
                  <th className={`${adminTable.th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} className={adminTable.tr}>
                    <td className={adminTable.td}>
                      <p className="font-medium text-neutral-900">
                        {inv.groomName || inv.brideName ? (
                          <>
                            {inv.groomName || "—"} <span className="text-[#b0843a]">&amp;</span> {inv.brideName || "—"}
                          </>
                        ) : (
                          <span className="text-neutral-400 font-normal">Details not added yet</span>
                        )}
                      </p>
                      <p className="text-xs text-neutral-400">
                        <span className="font-mono">{inv.invitationCode}</span> ·{" "}
                        {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </td>
                    <td className={`${adminTable.td} text-neutral-600`}>
                      {inv.customerName && <p className="text-neutral-800">{inv.customerName}</p>}
                      <p className="text-xs text-neutral-500">{inv.userMobile}</p>
                    </td>
                    <td className={`${adminTable.td} text-neutral-500`}>
                      {inv.templateName}
                      <span className="block text-xs text-neutral-400">₹{inv.price.toLocaleString("en-IN")}</span>
                    </td>
                    <td className={adminTable.td}>
                      <div className="flex flex-col items-start gap-1">
                        <StatusPill status={inv.status} />
                        {inv.detailsSubmittedAt && isDraft(inv.status) && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Customer sent details
                          </span>
                        )}
                        {!inv.detailsSubmittedAt && inv.hasDetailsLink && isDraft(inv.status) && (
                          <span className="text-[11px] text-neutral-400">Form link sent</span>
                        )}
                      </div>
                    </td>
                    <td className={`${adminTable.td} text-right whitespace-nowrap space-x-2`}>
                      {isLive(inv.status) && (
                        <a
                          href={`/invite/${inv.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block px-3 py-1.5 rounded-full text-xs border border-[#e7dcd3] text-neutral-700 hover:bg-[#fdf8f1]"
                        >
                          View
                        </a>
                      )}
                      <Link
                        href={`/admin/invitations/${inv.id}`}
                        className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-[#140d0e] text-white hover:bg-black"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      {showNew && <NewInvitationDialog onClose={() => setShowNew(false)} onCreated={(id) => router.push(`/admin/invitations/${id}`)} />}
    </AdminShell>
  );
}

function NewInvitationDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const adminFetch = useAdminFetch();
  const [templates, setTemplates] = useState<TemplateOption[] | null>(null);
  const [form, setForm] = useState({ templateId: "", customerMobile: "", customerName: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/templates")
      .then((r) => r.json())
      .then((d) => setTemplates((d.templates ?? []).sort((a: TemplateOption, b: TemplateOption) => a.name.localeCompare(b.name))))
      .catch(() => setTemplates([]));
  }, [adminFetch]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const r = await adminFetch("/api/admin/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok) return setError(d.error ?? "Couldn't create the invitation.");
    onCreated(d.invitation.id);
  }

  const label = "block text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={create} className="wv-dropdown-in w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        <div>
          <p className="text-lg font-semibold text-neutral-900">New invitation</p>
          <p className="text-sm text-neutral-500">For a customer who ordered on WhatsApp.</p>
        </div>
        <div>
          <label className={label}>Template</label>
          <select
            required
            value={form.templateId}
            onChange={(e) => setForm({ ...form, templateId: e.target.value })}
            className={`${adminInput} w-full`}
            disabled={!templates}
          >
            <option value="">{templates ? "Choose the template they ordered" : "Loading templates…"}</option>
            {templates?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.status !== "ACTIVE" ? " (hidden)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Customer WhatsApp number</label>
          <input
            required
            inputMode="tel"
            placeholder="98765 43210"
            value={form.customerMobile}
            onChange={(e) => setForm({ ...form, customerMobile: e.target.value })}
            className={`${adminInput} w-full`}
          />
        </div>
        <div>
          <label className={label}>Customer name (optional)</label>
          <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className={`${adminInput} w-full`} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-neutral-600 hover:bg-neutral-100">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60">
            {saving ? "Creating…" : "Create & open"}
          </button>
        </div>
      </form>
    </div>
  );
}
