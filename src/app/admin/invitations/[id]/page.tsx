"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell, AdminPanel, StatusPill } from "@/components/AdminShell";
import { InvitationEditor } from "@/components/InvitationEditor";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useAdminFetch } from "@/lib/use-admin-fetch";
import { BUSINESS_NAME } from "@/lib/site-config";
import { waToCustomer } from "@/lib/wa";
import type { InvitationData } from "@/lib/invitation-types";

interface AdminInvitationDetail {
  id: string;
  slug: string;
  status: string;
  invitationCode: string;
  data: InvitationData;
  activatedAt: string | null;
  detailsToken: string | null;
  detailsSubmittedAt: string | null;
  customer: { name: string | null; mobile: string };
  template: { id: string; name: string; componentKey: string };
}

const btn = "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50";
const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/**
 * Admin invitation builder: fill in a customer's details (from WhatsApp), publish the invitation
 * and send them the link — or send them a private form link to type the details themselves.
 */
export default function AdminInvitationBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const adminFetch = useAdminFetch();
  const [inv, setInv] = useState<AdminInvitationDetail | null>(null);
  const [data, setData] = useState<InvitationData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "unsaved">("idle");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [origin, setOrigin] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLive = !!inv && (inv.status === "ACTIVE" || inv.status === "PUBLISHED");
  const wasPublished = !!inv?.activatedAt;

  const load = useCallback(async () => {
    const r = await adminFetch(`/api/admin/invitations/${id}`);
    if (!r.ok) return setNotFound(true);
    const d = await r.json();
    setInv(d.invitation);
    setData(d.invitation.data);
    setSaveState("idle");
  }, [adminFetch, id]);

  useEffect(() => {
    setOrigin(window.location.origin);
    load();
  }, [load]);

  const save = useCallback(
    async (next: InvitationData) => {
      setSaveState("saving");
      const r = await adminFetch(`/api/admin/invitations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: next }),
      });
      setSaveState(r.ok ? "saved" : "unsaved");
      if (!r.ok) setNotice({ ok: false, text: "Couldn't save. Please try again." });
      return r.ok;
    },
    [adminFetch, id]
  );

  // Drafts save as you type. A published invitation saves only on "Save changes", so half-typed
  // edits never show on the live page.
  function update(patch: Partial<InvitationData>) {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      if (!wasPublished) {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => save(next), 800);
      }
      return next;
    });
    if (wasPublished) setSaveState("unsaved");
  }

  async function act(name: string, fn: () => Promise<void>) {
    setBusy(name);
    setNotice(null);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  }

  const publish = () =>
    act("publish", async () => {
      if (!data) return;
      if (timer.current) clearTimeout(timer.current);
      if (!(await save(data))) return;
      const r = await adminFetch(`/api/admin/invitations/${id}/publish`, { method: "POST" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setNotice({ ok: false, text: d.error ?? "Couldn't publish." });
      setNotice({ ok: true, text: "Published! The invitation link is ready to send." });
      await load();
    });

  const saveLive = () =>
    act("save", async () => {
      if (!data || !window.confirm("Save these changes? They appear on the live invitation right away.")) return;
      if (await save(data)) setNotice({ ok: true, text: "Changes saved and live." });
    });

  const setStatus = (status: "ACTIVE" | "INACTIVE") =>
    act("status", async () => {
      if (status === "INACTIVE" && !window.confirm("Deactivate this invitation?\n\nThe link stops working for all guests until you reactivate it.")) return;
      const r = await adminFetch(`/api/admin/invitations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) return setNotice({ ok: false, text: "Couldn't change the status." });
      await load();
    });

  const detailsLink = (action: "create" | "revoke") =>
    act("details", async () => {
      if (action === "create" && inv?.detailsToken && !window.confirm("Create a new link? The old link will stop working.")) return;
      if (action === "revoke" && !window.confirm("Turn off the customer's details link?")) return;
      const r = await adminFetch(`/api/admin/invitations/${id}/details-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!r.ok) return setNotice({ ok: false, text: "Couldn't update the details link." });
      await load();
    });

  const remove = () =>
    act("delete", async () => {
      if (!window.confirm("Delete this draft? This can't be undone.")) return;
      const r = await adminFetch(`/api/admin/invitations/${id}`, { method: "DELETE" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setNotice({ ok: false, text: d.error ?? "Couldn't delete." });
      router.push("/admin/invitations");
    });

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice({ ok: true, text: `${what} copied.` });
    } catch {
      window.prompt(`Copy the ${what.toLowerCase()}:`, text);
    }
  }

  if (notFound) {
    return (
      <AdminShell>
        <p className="text-neutral-500">Invitation not found.</p>
        <Link href="/admin/invitations" className="text-sm text-[#b0843a] underline">
          Back to Invitations
        </Link>
      </AdminShell>
    );
  }
  if (!inv || !data) {
    return (
      <AdminShell>
        <div className="h-40 rounded-2xl bg-white/70 border border-[#efe5dd] animate-pulse" />
      </AdminShell>
    );
  }

  const liveUrl = `${origin}/invite/${inv.slug}`;
  const formUrl = inv.detailsToken ? `${origin}/details/${inv.detailsToken}` : "";
  const greeting = `Hello${inv.customer.name ? ` ${inv.customer.name}` : ""}!`;
  const couple = data.groomName && data.brideName ? `${data.groomName} & ${data.brideName}` : "your";

  return (
    <AdminShell>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <Link href="/admin/invitations" className="text-xs text-neutral-500 hover:text-neutral-800">
            Back to Invitations
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
            {data.groomName || data.brideName ? `${data.groomName || "Groom"} & ${data.brideName || "Bride"}` : "New invitation"}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {inv.template.name} · {inv.customer.name ? `${inv.customer.name} · ` : ""}
            {inv.customer.mobile} · <span className="font-mono text-xs">{inv.invitationCode}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={inv.status} />
          <span className="text-xs text-neutral-400 w-24">
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "unsaved" ? "Unsaved changes" : ""}
          </span>
          {!wasPublished ? (
            <>
              <button onClick={remove} disabled={!!busy} className={`${btn} text-red-600 hover:bg-red-50`}>
                Delete draft
              </button>
              <button onClick={publish} disabled={!!busy} className={`${btn} bg-rose-600 text-white hover:bg-rose-700`}>
                {busy === "publish" ? "Publishing…" : "Publish invitation"}
              </button>
            </>
          ) : (
            <>
              {isLive ? (
                <button onClick={() => setStatus("INACTIVE")} disabled={!!busy} className={`${btn} text-red-600 hover:bg-red-50`}>
                  Deactivate
                </button>
              ) : (
                <button onClick={() => setStatus("ACTIVE")} disabled={!!busy} className={`${btn} bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}>
                  Reactivate
                </button>
              )}
              <button onClick={saveLive} disabled={!!busy || saveState !== "unsaved"} className={`${btn} bg-rose-600 text-white hover:bg-rose-700`}>
                {busy === "save" ? "Saving…" : "Save changes"}
              </button>
            </>
          )}
        </div>
      </div>

      {notice && (
        <p role="status" className={`mb-4 rounded-xl px-4 py-3 text-sm border ${notice.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}>
          {notice.text}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        {/* Invitation link */}
        <AdminPanel className="p-5">
          <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Invitation link</p>
          {wasPublished ? (
            <>
              <p className="mt-2 text-sm font-mono break-all text-neutral-800">{liveUrl}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => copy(liveUrl, "Invitation link")} className={`${btn} border border-[#e7dcd3] hover:bg-[#fdf8f1]`}>
                  Copy link
                </button>
                <a href={liveUrl} target="_blank" rel="noreferrer" className={`${btn} border border-[#e7dcd3] hover:bg-[#fdf8f1]`}>
                  View
                </a>
                <a
                  href={waToCustomer(inv.customer.mobile, `${greeting} 🎉 Your wedding invitation is ready:\n${liveUrl}\n\nShare this link with all your guests. Thank you for choosing ${BUSINESS_NAME}!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btn} bg-[#25D366] text-white hover:bg-[#1ebe5b]`}
                >
                  <WhatsAppIcon className="w-4 h-4" /> Send to customer
                </a>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">
              Fill in at least the couple&apos;s names, wedding date and venue, then press <b>Publish invitation</b> to create the shareable link.
            </p>
          )}
        </AdminPanel>

        {/* Customer details form link */}
        <AdminPanel className="p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Customer details form</p>
            {inv.detailsSubmittedAt && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Submitted {fmt(inv.detailsSubmittedAt)}
              </span>
            )}
          </div>
          {wasPublished ? (
            <p className="mt-2 text-sm text-neutral-500">Published invitations are edited here by the team only.</p>
          ) : formUrl ? (
            <>
              <p className="mt-2 text-sm font-mono break-all text-neutral-800">{formUrl}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={waToCustomer(inv.customer.mobile, `${greeting} Please fill in your wedding details and add your photos here for ${couple === "your" ? "your" : couple + "'s"} invitation:\n${formUrl}\n\nEverything saves as you type. Press "Submit details" when you're done.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btn} bg-[#25D366] text-white hover:bg-[#1ebe5b]`}
                >
                  <WhatsAppIcon className="w-4 h-4" /> Send to customer
                </a>
                <button onClick={() => copy(formUrl, "Form link")} className={`${btn} border border-[#e7dcd3] hover:bg-[#fdf8f1]`}>
                  Copy
                </button>
                <button onClick={load} className={`${btn} border border-[#e7dcd3] hover:bg-[#fdf8f1]`} title="Load the latest details the customer typed">
                  Reload their details
                </button>
                <button onClick={() => detailsLink("revoke")} disabled={!!busy} className={`${btn} text-red-600 hover:bg-red-50`}>
                  Turn off
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-neutral-500">Let the customer type their own details and upload photos, without logging in.</p>
              <button onClick={() => detailsLink("create")} disabled={!!busy} className={`${btn} mt-3 border border-[#e7dcd3] hover:bg-[#fdf8f1]`}>
                Create form link
              </button>
            </>
          )}
        </AdminPanel>
      </div>

      <AdminPanel className="overflow-hidden">
        <InvitationEditor componentKey={inv.template.componentKey} data={data} onChange={update} />
      </AdminPanel>
    </AdminShell>
  );
}
