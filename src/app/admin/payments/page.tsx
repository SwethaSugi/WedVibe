"use client";

import { useEffect, useState } from "react";
import { AdminShell, AdminPageHeader, AdminPanel, StatusPill, AdminEmpty, AdminLoadingRows, adminTable } from "@/components/AdminShell";
import { useAdminFetch } from "@/lib/use-admin-fetch";

interface AdminPayment {
  id: string;
  orderId: string;
  paymentId: string | null;
  userMobile: string;
  invitationCode: string | null;
  amount: number;
  currency: string;
  gateway: string;
  status: string;
  createdAt: string;
}

const STATUSES = ["SUCCESS", "FAILED", "CREATED", "DUPLICATE", "REFUNDED"];
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function AdminPaymentsPage() {
  const adminFetch = useAdminFetch();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    const url = statusFilter ? `/api/admin/payments?status=${statusFilter}` : "/api/admin/payments";
    adminFetch(url)
      .then((res) => res.json())
      .then((d) => setPayments(d.payments ?? []))
      .finally(() => setLoading(false));
  }, [statusFilter, adminFetch]);

  const total = payments.filter((p) => p.status === "SUCCESS").reduce((sum, p) => sum + p.amount, 0);

  const chip = (active: boolean) =>
    `px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
      active ? "bg-[#140d0e] text-white" : "bg-white border border-[#e7dcd3] text-neutral-600 hover:border-[#d9b36a]"
    }`;

  return (
    <AdminShell>
      <AdminPageHeader
        title="Payments"
        subtitle={loading ? "Loading…" : `${payments.length} payment${payments.length === 1 ? "" : "s"} · ₹${total.toLocaleString("en-IN")} collected`}
      />
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setStatusFilter("")} className={chip(!statusFilter)}>
          All
        </button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={chip(statusFilter === s)}>
            {label(s)}
          </button>
        ))}
      </div>
      <AdminPanel>
        {loading ? (
          <AdminLoadingRows />
        ) : payments.length === 0 ? (
          <AdminEmpty icon="₹" title={statusFilter ? `No ${label(statusFilter).toLowerCase()} payments` : "No payments yet"} />
        ) : (
          <div className={adminTable.wrap}>
            <table className={adminTable.table}>
              <thead className={adminTable.thead}>
                <tr>
                  <th className={adminTable.th}>Order</th>
                  <th className={adminTable.th}>Customer</th>
                  <th className={adminTable.th}>Invitation</th>
                  <th className={adminTable.th}>Amount</th>
                  <th className={adminTable.th}>Gateway</th>
                  <th className={adminTable.th}>Status</th>
                  <th className={adminTable.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className={adminTable.tr}>
                    <td className={`${adminTable.td} font-mono text-xs text-neutral-500`}>{p.orderId}</td>
                    <td className={`${adminTable.td} text-neutral-600`}>{p.userMobile}</td>
                    <td className={`${adminTable.td} font-mono text-xs text-neutral-500`}>{p.invitationCode ?? "—"}</td>
                    <td className={`${adminTable.td} font-semibold text-neutral-900`}>₹{p.amount.toLocaleString("en-IN")}</td>
                    <td className={adminTable.td}>
                      <span className="px-2 py-0.5 rounded-md bg-[#faf5f1] text-xs text-neutral-600 capitalize">{p.gateway}</span>
                    </td>
                    <td className={adminTable.td}>
                      <StatusPill status={p.status} />
                    </td>
                    <td className={`${adminTable.td} text-neutral-500`}>
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
