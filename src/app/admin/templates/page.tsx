"use client";

import { useEffect, useState } from "react";
import { AdminShell, AdminPageHeader, AdminPanel, StatusPill, AdminEmpty, AdminLoadingRows, adminTable, adminInput } from "@/components/AdminShell";
import { useAdminFetch } from "@/lib/use-admin-fetch";
import { priceInfo } from "@/lib/pricing";

interface AdminTemplate {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  offerPrice: number | null;
  status: string;
  previewImage: string | null;
}

export default function AdminTemplatesPage() {
  const adminFetch = useAdminFetch();
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [offerError, setOfferError] = useState<{ id: string; message: string } | null>(null);
  const [bulk, setBulk] = useState<{ percent: string; busy: boolean; note: { ok: boolean; text: string } | null }>({
    percent: "",
    busy: false,
    note: null,
  });

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

  // Empty field removes the offer.
  async function updateOffer(t: AdminTemplate, raw: string) {
    const offerPrice = raw.trim() === "" ? null : Number(raw);
    if (offerPrice === t.offerPrice) return;
    setOfferError(null);
    if (offerPrice !== null && (!Number.isInteger(offerPrice) || offerPrice <= 0 || offerPrice >= t.price)) {
      setOfferError({ id: t.id, message: "Must be lower than the price" });
      load();
      return;
    }
    const res = await adminFetch(`/api/admin/templates/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerPrice }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setOfferError({ id: t.id, message: d.error ?? "Unable to save" });
    } else {
      setSavedId(t.id);
      setTimeout(() => setSavedId((id) => (id === t.id ? null : id)), 1800);
    }
    load();
  }

  // One discount for every template: sets each offer price from its own price, or clears them all.
  async function applyBulkOffer(percent: number | null) {
    const message =
      percent === null
        ? "Remove the offer price from every template?"
        : `Apply ${percent}% off to all ${templates.length} templates?\n\nThis replaces any offer prices set one by one.`;
    if (!window.confirm(message)) return;
    setBulk((b) => ({ ...b, busy: true, note: null }));
    const res = await adminFetch("/api/admin/templates/bulk-offer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percent }),
    });
    const d = await res.json().catch(() => ({}));
    setBulk((b) => ({
      ...b,
      busy: false,
      note: !res.ok
        ? { ok: false, text: d.error ?? "Unable to apply the discount." }
        : { ok: true, text: percent === null ? "All offers removed." : `${percent}% off applied to all templates.` },
    }));
    load();
  }

  const filtered = templates.filter((t) => `${t.name} ${t.category}`.toLowerCase().includes(search.toLowerCase()));
  const activeCount = templates.filter((t) => t.status === "ACTIVE").length;
  const offerCount = templates.filter((t) => priceInfo(t).original !== null).length;
  const bulkPercent = Number(bulk.percent);
  const bulkValid = Number.isInteger(bulkPercent) && bulkPercent >= 1 && bulkPercent <= 90;
  const example = templates[0];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Templates"
        subtitle={loading ? "Loading…" : `${templates.length} templates · ${activeCount} live in the marketplace`}
        actions={<input placeholder="Search templates…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${adminInput} w-56`} />}
      />

      {/* Discount for all templates */}
      <AdminPanel className="mb-6 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="flex items-start gap-3 lg:flex-1 min-w-0">
            <span className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              %
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-neutral-900">Discount for all templates</p>
              <p className="text-sm text-neutral-500 mt-0.5">
                Sets every template&apos;s offer price from its own price. You can still change single templates below.
              </p>
              <p className="text-xs mt-1.5 text-neutral-400">
                {offerCount > 0 ? `${offerCount} of ${templates.length} templates currently on offer.` : "No templates on offer right now."}
                {bulkValid && example && (
                  <>
                    {" "}
                    Example: {example.name} ₹{example.price} becomes ₹{Math.round(example.price * (1 - bulkPercent / 100))}.
                  </>
                )}
              </p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (bulkValid) applyBulkOffer(bulkPercent);
            }}
            className="flex flex-wrap items-center gap-2"
          >
            <div className="relative">
              <input
                type="number"
                min={1}
                max={90}
                step={1}
                inputMode="numeric"
                aria-label="Discount percentage for all templates"
                placeholder="20"
                value={bulk.percent}
                onChange={(e) => setBulk((b) => ({ ...b, percent: e.target.value, note: null }))}
                className={`${adminInput} w-28 pr-8`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 pointer-events-none">%</span>
            </div>
            <button
              type="submit"
              disabled={!bulkValid || bulk.busy || templates.length === 0}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {bulk.busy ? "Applying…" : "Apply to all"}
            </button>
            <button
              type="button"
              onClick={() => applyBulkOffer(null)}
              disabled={bulk.busy || offerCount === 0}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-[#e7dcd3] text-neutral-700 hover:bg-[#fdf8f1] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Remove all offers
            </button>
          </form>
        </div>
        {bulk.percent !== "" && !bulkValid && <p className="mt-3 text-xs text-red-500">Enter a whole percentage between 1 and 90.</p>}
        {bulk.note && <p className={`mt-3 text-sm ${bulk.note.ok ? "text-emerald-600" : "text-red-500"}`}>{bulk.note.text}</p>}
      </AdminPanel>

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
                  <th className={adminTable.th}>Offer price (₹)</th>
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
                          key={`price-${t.price}`}
                          type="number"
                          min={0}
                          aria-label={`Price for ${t.name}`}
                          defaultValue={t.price}
                          onBlur={(e) => updatePrice(t, Number(e.target.value))}
                          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                          className={`${adminInput} w-24 py-1.5`}
                        />
                        {savedId === t.id && <span className="text-xs text-emerald-600">Saved ✓</span>}
                      </div>
                    </td>
                    <td className={adminTable.td}>
                      {(() => {
                        const { percentOff, original } = priceInfo(t);
                        const stale = t.offerPrice != null && original === null;
                        return (
                          <div className="flex items-center gap-2">
                            <input
                              key={`offer-${t.offerPrice}-${t.price}`}
                              type="number"
                              min={1}
                              placeholder="No offer"
                              aria-label={`Offer price for ${t.name}`}
                              defaultValue={t.offerPrice ?? ""}
                              onBlur={(e) => updateOffer(t, e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                              className={`${adminInput} w-24 py-1.5 placeholder:text-neutral-300`}
                            />
                            {offerError?.id === t.id ? (
                              <span className="text-xs text-red-500">{offerError.message}</span>
                            ) : percentOff > 0 ? (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                {percentOff}% OFF
                              </span>
                            ) : stale ? (
                              <span className="text-xs text-amber-600" title="The offer is not lower than the price, so customers see the regular price.">
                                Not applied
                              </span>
                            ) : null}
                          </div>
                        );
                      })()}
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
