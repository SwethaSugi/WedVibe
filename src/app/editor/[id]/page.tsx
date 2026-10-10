"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { InvitationData } from "@/lib/invitation-types";
import { InvitationEditor } from "@/components/InvitationEditor";
import type { EditInfo } from "@/lib/edit-policy";

interface LoadedInvitation {
  id: string;
  slug: string;
  status: string;
  data: InvitationData;
  editInfo: EditInfo;
  template: { id: string; name: string; componentKey: string; price: number; currency: string };
}

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invitationId = params.id;

  const [invitation, setInvitation] = useState<LoadedInvitation | null>(null);
  const [data, setData] = useState<InvitationData | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [dirty, setDirty] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Live invitations have a limited number of saves, so they don't autosave.
  const autosave = invitation ? !invitation.editInfo.isLive : false;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    fetch(`/api/invitations/${invitationId}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) {
          router.push("/templates");
          return;
        }
        setInvitation(d.invitation);
        setData(d.invitation.data);
      });
  }, [invitationId, router]);

  const saveDraft = useCallback(
    async (next: InvitationData) => {
      setSaveState("saving");
      try {
        await fetch(`/api/invitations/${invitationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: next }),
        });
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
    },
    [invitationId]
  );

  function update(patch: Partial<InvitationData>) {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      if (autosave) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => saveDraft(next), 800);
      }
      return next;
    });
    if (!autosave) {
      setDirty(true);
      setSaveState("idle");
    }
  }

  async function handleSaveChanges() {
    if (!data || !invitation) return;
    const { editsAllowed, editsUsed } = invitation.editInfo;
    const leftAfter = editsAllowed - editsUsed - 1;
    if (
      !window.confirm(
        `Publish these changes to your live invitation?\n\nThis uses 1 of your ${editsAllowed} edits. ` +
          (leftAfter > 0 ? `You'll have ${leftAfter} left.` : "This is your last edit.")
      )
    ) {
      return;
    }

    setError("");
    setGenerating(true);
    setSaveState("saving");
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const body = await res.json().catch(() => ({}));
      if (body.editInfo) {
        setInvitation((prev) => (prev ? { ...prev, editInfo: body.editInfo } : prev));
      }
      if (!res.ok) {
        setError(body.error ?? "Unable to save your changes. Please try again.");
        setSaveState("idle");
        return;
      }
      setDirty(false);
      setSaveState("saved");
    } catch {
      setError("Unable to save your changes. Please try again.");
      setSaveState("idle");
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerate() {
    if (!data) return;
    setError("");
    setGenerating(true);
    try {
      await saveDraft(data);

      const genRes = await fetch(`/api/invitations/${invitationId}/generate`, { method: "POST" });
      const genData = await genRes.json();
      if (!genRes.ok) {
        setError(genData.error ?? "Unable to generate invitation. Please try again.");
        setGenerating(false);
        return;
      }

      // The link is only created after the payment page verifies a successful payment.
      router.push(`/payment/${genData.orderId}`);
    } catch {
      setError("Unable to generate invitation. Please try again.");
      setGenerating(false);
    }
  }

  if (!invitation || !data) {
    return <div className="flex-1 flex items-center justify-center text-neutral-400">Loading editor…</div>;
  }

  const isLive = invitation.status === "ACTIVE" || invitation.status === "PUBLISHED";
  const isInactive = invitation.status === "INACTIVE";
  const { editInfo } = invitation;
  const editingClosed = isLive && !editInfo.canEdit;
  const editsLeft = editInfo.editsAllowed - editInfo.editsUsed;
  const windowEndLabel = editInfo.editWindowEndsAt
    ? new Date(editInfo.editWindowEndsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <div className="flex flex-col flex-1">
      <div className="border-b border-neutral-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 bg-white sticky top-16 z-30">
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-800">{invitation.template.name}</p>
          <p className="text-xs text-neutral-400 flex items-center gap-1.5 h-4">
            {saveState === "saving" && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Saving…
              </>
            )}
            {saveState === "saved" && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {isLive ? "Changes published" : "Draft saved"}
              </>
            )}
            {saveState === "idle" && isLive && dirty && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Unsaved changes
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {isLive && (
            <a
              href={`/invite/${invitation.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full border border-neutral-300 text-sm font-medium hover:bg-neutral-50"
            >
              View Live Page
            </a>
          )}
          {!isInactive && !editingClosed && (
            <button
              onClick={isLive ? handleSaveChanges : handleGenerate}
              disabled={generating || (isLive && !dirty)}
              className="px-5 py-2 rounded-full bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-60"
            >
              {generating
                ? "Processing…"
                : isLive
                  ? "Save Changes"
                  : invitation.status === "PAYMENT_PENDING"
                    ? `Continue to Payment · ₹${invitation.template.price}`
                    : `Generate Invitation · ₹${invitation.template.price}`}
            </button>
          )}
        </div>
      </div>

      {isLive && !editingClosed && (
        <div className="mx-6 mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          <span className="font-medium">
            {editsLeft} of {editInfo.editsAllowed} edits left
          </span>{" "}
          · editing closes on {windowEndLabel}. Changes go live only when you click <b>Save Changes</b>, and each save
          uses one edit.
        </div>
      )}

      {editingClosed && (
        <div className="mx-6 mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
          <p className="font-medium text-amber-800">{editInfo.reason}</p>
          <p className="text-amber-700 mt-1">
            Your invitation is still live and guests can view it. Need a change?{" "}
            <a href="/custom-invitation" className="underline font-medium">
              Contact support
            </a>
            .
          </p>
        </div>
      )}

      {isInactive && (
        <div className="mx-6 mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
          <p className="font-medium text-amber-800">This invitation has been deactivated</p>
          <p className="text-amber-700 mt-1">
            Its link is currently offline for guests and it can&apos;t be edited. If you think this is a mistake,{" "}
            <a href="/custom-invitation" className="underline font-medium">
              contact support
            </a>
            .
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-500 px-6 pt-3">{error}</p>}

      <InvitationEditor
        componentKey={invitation.template.componentKey}
        data={data}
        onChange={update}
        disabled={isInactive || editingClosed}
      />
    </div>
  );
}

