"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-600",
  PAYMENT_PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-red-100 text-red-600",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PAYMENT_PENDING: "Payment Pending",
  PAID: "Paid",
  PUBLISHED: "Published",
  ACTIVE: "Live",
  INACTIVE: "Inactive",
};

export default function DashboardPage() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<InvitationSummary[] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((d) => {
        if (!d.user) {
          router.push("/login?next=/dashboard");
          return;
        }
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

  if (invitations === null) {
    return <div className="flex-1 flex items-center justify-center text-neutral-400">Loading…</div>;
  }

  return (
    <div className="bg-neutral-50 flex-1">
      <div className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">My Invitations</h1>
            <p className="text-neutral-500 mt-1 text-sm">
              {invitations.length > 0
                ? `${invitations.length} invitation${invitations.length > 1 ? "s" : ""}`
                : "Your wedding invitations, all in one place."}
            </p>
          </div>
          <Link
            href="/templates"
            className="px-5 py-2.5 rounded-full bg-rose-600 text-white text-sm font-medium shadow-sm hover:bg-rose-700 hover:shadow-md transition-all"
          >
            + Create New Invitation
          </Link>
        </div>

        {invitations.length === 0 ? (
          <div className="mt-16 text-center py-20 border border-dashed border-neutral-300 rounded-3xl bg-white">
            <p className="text-4xl mb-3">💌</p>
            <p className="text-neutral-500">You haven&apos;t created any invitations yet.</p>
            <Link href="/templates" className="inline-block mt-4 text-rose-600 font-medium hover:underline">
              Browse templates →
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map((inv) => {
              const isLive = inv.status === "ACTIVE" || inv.status === "PUBLISHED";
              return (
                <div
                  key={inv.id}
                  className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="relative h-40 bg-neutral-900 overflow-hidden">
                    {inv.templatePreviewImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={inv.templatePreviewImage}
                        alt={inv.templateName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-500 text-sm">
                        {inv.templateName}
                      </div>
                    )}
                    <span
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur ${STATUS_STYLES[inv.status] ?? "bg-neutral-100 text-neutral-600"}`}
                    >
                      {STATUS_LABEL[inv.status] ?? inv.status}
                    </span>
                  </div>

                  <div className="p-5">
                    <p className="font-semibold text-lg leading-tight truncate">
                      {inv.data.groomName || inv.data.brideName ? (
                        <>
                          {inv.data.groomName || "Groom"} &amp; {inv.data.brideName || "Bride"}
                        </>
                      ) : (
                        <span className="text-neutral-400">Untitled draft</span>
                      )}
                    </p>
                    <p className="text-sm text-neutral-500 mt-0.5">{inv.templateName}</p>

                    {isLive && (
                      <p className="text-xs text-neutral-400 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        {inv.views} view{inv.views === 1 ? "" : "s"}
                        {inv.editInfo.canEdit && inv.editInfo.editWindowEndsAt && (
                          <span>
                            {" "}
                            · {inv.editInfo.editsAllowed - inv.editInfo.editsUsed} edit
                            {inv.editInfo.editsAllowed - inv.editInfo.editsUsed === 1 ? "" : "s"} left until{" "}
                            {new Date(inv.editInfo.editWindowEndsAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      {inv.editInfo.canEdit ? (
                        <Link
                          href={`/editor/${inv.id}`}
                          className="text-sm font-medium px-3.5 py-1.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
                        >
                          Edit
                        </Link>
                      ) : (
                        <span
                          title={inv.editInfo.reason ?? undefined}
                          className="text-sm font-medium px-3.5 py-1.5 rounded-full bg-neutral-200 text-neutral-400 cursor-not-allowed"
                        >
                          Editing closed
                        </span>
                      )}
                      {isLive && (
                        <>
                          <Link
                            href={`/invite/${inv.slug}`}
                            target="_blank"
                            className="text-sm font-medium px-3.5 py-1.5 rounded-full border border-neutral-300 hover:bg-neutral-50 transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => copyLink(inv)}
                            className="text-sm font-medium px-3.5 py-1.5 rounded-full border border-neutral-300 hover:bg-neutral-50 transition-colors"
                          >
                            {copiedId === inv.id ? "Invite copied ✓" : "Copy Link"}
                          </button>
                        </>
                      )}
                      {inv.status === "PAYMENT_PENDING" && (
                        <button
                          onClick={() => completePayment(inv)}
                          className="text-sm font-medium px-3.5 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                        >
                          Complete Payment
                        </button>
                      )}
                      {inv.status === "DRAFT" && (
                        <button
                          onClick={() => removeDraft(inv)}
                          className="text-sm font-medium px-3.5 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
