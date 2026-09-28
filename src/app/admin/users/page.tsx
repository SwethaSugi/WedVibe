"use client";

import { useEffect, useState } from "react";
import { AdminShell, AdminPageHeader, AdminPanel, StatusPill, AdminEmpty, AdminLoadingRows, adminTable, adminInput } from "@/components/AdminShell";
import { useAdminFetch } from "@/lib/use-admin-fetch";

interface AdminUser {
  id: string;
  name: string | null;
  mobile: string;
  status: string;
  createdAt: string;
  totalInvitations: number;
  totalPayments: number;
}

export default function AdminUsersPage() {
  const adminFetch = useAdminFetch();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  function load() {
    adminFetch("/api/admin/users")
      .then((res) => res.json())
      .then((d) => setUsers(d.users ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleStatus(u: AdminUser) {
    const nextStatus = u.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    if (nextStatus === "DISABLED" && !window.confirm(`Disable ${u.name || u.mobile}?\n\nThey won't be able to log in until you activate them again.`)) {
      return;
    }
    setBusyId(u.id);
    setNotice(null);
    try {
      const res = await adminFetch(`/api/admin/users/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setNotice({ ok: false, text: d.error ?? "Couldn't update this user. Please try again." });
      } else {
        setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, status: nextStatus } : x)));
        setNotice({
          ok: true,
          text: nextStatus === "DISABLED" ? `${u.name || u.mobile} is disabled and has been signed out.` : `${u.name || u.mobile} can log in again.`,
        });
      }
    } catch {
      setNotice({ ok: false, text: "Couldn't reach the server. Please check your connection and try again." });
    } finally {
      setBusyId(null);
      load();
    }
  }

  const filtered = users.filter((u) => `${u.name ?? ""} ${u.mobile}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminShell>
      <AdminPageHeader
        title="Users"
        subtitle={loading ? "Loading…" : `${users.length} registered customer${users.length === 1 ? "" : "s"}`}
        actions={<input placeholder="Search name or mobile…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${adminInput} w-56`} />}
      />
      {notice && (
        <p
          role="status"
          className={`mb-4 rounded-xl px-4 py-3 text-sm border ${
            notice.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {notice.text}
        </p>
      )}
      <AdminPanel>
        {loading ? (
          <AdminLoadingRows />
        ) : filtered.length === 0 ? (
          <AdminEmpty icon="👤" title={search ? "No users match your search" : "No users yet"} />
        ) : (
          <div className={adminTable.wrap}>
            <table className={adminTable.table}>
              <thead className={adminTable.thead}>
                <tr>
                  <th className={adminTable.th}>Customer</th>
                  <th className={adminTable.th}>Joined</th>
                  <th className={adminTable.th}>Invitations</th>
                  <th className={adminTable.th}>Payments</th>
                  <th className={adminTable.th}>Status</th>
                  <th className={`${adminTable.th} text-right`}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className={adminTable.tr}>
                    <td className={adminTable.td}>
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center text-sm font-semibold uppercase">
                          {(u.name?.trim() || u.mobile.slice(-2)).slice(0, 1)}
                        </span>
                        <div>
                          <p className="font-medium text-neutral-900">{u.name || "—"}</p>
                          <p className="text-xs text-neutral-500">{u.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`${adminTable.td} text-neutral-500`}>
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className={adminTable.td}>{u.totalInvitations}</td>
                    <td className={adminTable.td}>{u.totalPayments}</td>
                    <td className={adminTable.td}>
                      <StatusPill status={u.status} />
                    </td>
                    <td className={`${adminTable.td} text-right`}>
                      <button
                        onClick={() => toggleStatus(u)}
                        disabled={busyId !== null}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium disabled:opacity-50 disabled:cursor-wait ${
                          u.status === "ACTIVE" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {busyId === u.id ? (u.status === "ACTIVE" ? "Disabling…" : "Activating…") : u.status === "ACTIVE" ? "Disable" : "Activate"}
                      </button>
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
