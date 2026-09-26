"use client";

import { useEffect, useState } from "react";
import { AdminShell, AdminPageHeader, AdminPanel, StatusPill, AdminEmpty, AdminLoadingRows, adminTable, adminInput } from "@/components/AdminShell";
import { useAdminFetch } from "@/lib/use-admin-fetch";

interface AdminInvitation {
  id: string;
  invitationCode: string;
  slug: string;
  userMobile: string;
  groomName: string;
  brideName: string;
  templateName: string;
  status: string;
  createdAt: string;
}

export default function AdminInvitationsPage() {
  const adminFetch = useAdminFetch();
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  function load() {
    adminFetch("/api/admin/invitations")
      .then((res) => res.json())
      .then((d) => setInvitations(d.invitations ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleStatus(id: string, current: string) {
    const nextStatus = current === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (
      nextStatus === "INACTIVE" &&
      !window.confirm(
        "Deactivate this invitation?\n\nThe shared link will stop working for all guests until you reactivate it. The couple will not be notified."
      )
    ) {
      return;
    }
    await adminFetch(`/api/admin/invitations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    load();
  }

  const filtered = invitations.filter((inv) =>
    `${inv.groomName} ${inv.brideName} ${inv.userMobile} ${inv.invitationCode}`.toLowerCase().includes(search.toLowerCase())
  );
  const liveCount = invitations.filter((i) => i.status === "ACTIVE" || i.status === "PUBLISHED").length;

  return (
    <AdminShell>
      <AdminPageHeader
        title="Invitations"
        subtitle={loading ? "Loading…" : `${invitations.length} generated · ${liveCount} live`}
        actions={<input placeholder="Search couple, mobile, code…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${adminInput} w-60`} />}
      />
      <AdminPanel>
        {loading ? (
          <AdminLoadingRows />
        ) : filtered.length === 0 ? (
          <AdminEmpty icon="💌" title={search ? "No invitations match your search" : "No invitations generated yet"} />
        ) : (
          <div className={adminTable.wrap}>
            <table className={adminTable.table}>
              <thead className={adminTable.thead}>
                <tr>
                  <th className={adminTable.th}>Couple</th>
                  <th className={adminTable.th}>Code</th>
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
                        {inv.groomName} <span className="text-[#b0843a]">&amp;</span> {inv.brideName}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </td>
                    <td className={`${adminTable.td} font-mono text-xs text-neutral-500`}>{inv.invitationCode}</td>
                    <td className={`${adminTable.td} text-neutral-500`}>{inv.userMobile}</td>
                    <td className={`${adminTable.td} text-neutral-500`}>{inv.templateName}</td>
                    <td className={adminTable.td}>
                      <StatusPill status={inv.status} />
                    </td>
                    <td className={`${adminTable.td} text-right space-x-2`}>
                      <a
                        href={`/invite/${inv.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block px-3 py-1.5 rounded-full text-xs border border-[#e7dcd3] text-neutral-700 hover:bg-[#fdf8f1]"
                      >
                        View
                      </a>
                      {(inv.status === "ACTIVE" || inv.status === "INACTIVE") && (
                        <button
                          onClick={() => toggleStatus(inv.id, inv.status)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            inv.status === "ACTIVE" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {inv.status === "ACTIVE" ? "Deactivate" : "Reactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </AdminShell>
  );
}
