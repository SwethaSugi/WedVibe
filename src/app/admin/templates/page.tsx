"use client";

import { useEffect, useState } from "react";
import { AdminShell, AdminPageHeader, AdminPanel, StatusPill, AdminEmpty, AdminLoadingRows, adminTable, adminInput } from "@/components/AdminShell";
import { useAdminFetch } from "@/lib/use-admin-fetch";

interface AdminTemplate {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  status: string;
  previewImage: string | null;
}

export default function AdminTemplatesPage() {
  const adminFetch = useAdminFetch();
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  function load() {
    adminFetch("/api/admin/templates")
      .then((res) => res.json())
      .then((d) => setTemplates(d.templates ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function toggleStatus(id: string, current: string) {
    const nextStatus = current === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await adminFetch(`/api/admin/templates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    load();
  }

  async function updatePrice(t: AdminTemplate, price: number) {
    if (!Number.isFinite(price) || price < 0 || price === t.price) return;
    await adminFetch(`/api/admin/templates/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
    setSavedId(t.id);
    setTimeout(() => setSavedId((id) => (id === t.id ? null : id)), 1800);
    load();
  }

  const filtered = templates.filter((t) => `${t.name} ${t.category}`.toLowerCase().includes(search.toLowerCase()));
  const activeCount = templates.filter((t) => t.status === "ACTIVE").length;

  return (
    <AdminShell>
      <AdminPageHeader
        title="Templates"
        subtitle={loading ? "Loading…" : `${templates.length} templates · ${activeCount} live in the marketplace`}
        actions={<input placeholder="Search templates…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${adminInput} w-56`} />}
      />
      <AdminPanel>
        {loading ? (
          <AdminLoadingRows />
        ) : filtered.length === 0 ? (
          <AdminEmpty title="No templates found" hint={search ? "Try a different search." : undefined} />
        ) : (
          <div className={adminTable.wrap}>
            <table className={adminTable.table}>
              <thead className={adminTable.thead}>
                <tr>
                  <th className={adminTable.th}>Template</th>
                  <th className={adminTable.th}>Category</th>
                  <th className={adminTable.th}>Price (₹)</th>
                  <th className={adminTable.th}>Status</th>
                  <th className={`${adminTable.th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className={adminTable.tr}>
                    <td className={adminTable.td}>
                      <div className="flex items-center gap-3">
                        {t.previewImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.previewImage} alt="" className="w-11 h-14 rounded-lg object-cover border border-[#efe5dd]" />
                        ) : (
                          <span className="w-11 h-14 rounded-lg bg-[#faf1e6]" />
                        )}
                        <span className="font-medium text-neutral-900">{t.name}</span>
                      </div>
                    </td>
                    <td className={`${adminTable.td} text-neutral-500`}>{t.category}</td>
                    <td className={adminTable.td}>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          defaultValue={t.price}
                          onBlur={(e) => updatePrice(t, Number(e.target.value))}
                          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                          className={`${adminInput} w-24 py-1.5`}
                        />
                        {savedId === t.id && <span className="text-xs text-emerald-600">Saved ✓</span>}
                      </div>
                    </td>
                    <td className={adminTable.td}>
                      <StatusPill status={t.status} />
                    </td>
                    <td className={`${adminTable.td} text-right space-x-2`}>
                      <a
                        href={`/templates/${t.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block px-3 py-1.5 rounded-full text-xs border border-[#e7dcd3] text-neutral-700 hover:bg-[#fdf8f1]"
                      >
                        Preview
                      </a>
                      <button
                        onClick={() => toggleStatus(t.id, t.status)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          t.status === "ACTIVE" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {t.status === "ACTIVE" ? "Disable" : "Enable"}
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
