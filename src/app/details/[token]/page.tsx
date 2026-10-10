"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import type { InvitationData } from "@/lib/invitation-types";
import { InvitationEditor } from "@/components/InvitationEditor";
import { UploadAuthProvider } from "@/components/UploadAuth";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { BUSINESS_NAME, whatsappLink } from "@/lib/site-config";

interface Loaded {
  data: InvitationData;
  template: { name: string; componentKey: string };
  editable: boolean;
  submittedAt: string | null;
}

/**
 * The private no-login page a customer gets from us to fill in their own wedding details.
 * Changes save automatically; "Submit details" tells the team they're ready for review.
 */
export default function CustomerDetailsPage() {
  const { token } = useParams<{ token: string }>();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [data, setData] = useState<InvitationData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`/api/details/${token}`)
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) return setLoadError(d.error ?? "This link is not valid.");
        setLoaded(d.invitation);
        setData(d.invitation.data);
        setSubmitted(!!d.invitation.submittedAt);
      })
      .catch(() => setLoadError("Unable to load this page. Please check your connection."));
  }, [token]);

  const save = useCallback(
    async (next: InvitationData, submit = false) => {
      setSaveState("saving");
      const r = await fetch(`/api/details/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: next, submit }),
      }).catch(() => null);
      if (!r || !r.ok) {
        const d = r ? await r.json().catch(() => ({})) : {};
        setSaveState("error");
        setError(d.error ?? "Couldn't save. Please check your connection and try again.");
        return false;
      }
      setSaveState("saved");
      setError("");
      return true;
    },
    [token]
  );

  function update(patch: Partial<InvitationData>) {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => save(next), 800);
      return next;
    });
  }

  async function submit() {
    if (!data) return;
    if (!data.groomName?.trim() || !data.brideName?.trim() || !data.weddingDate || !data.venueName?.trim()) {
      setError("Please fill in the groom and bride names, wedding date and venue before submitting.");
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setSubmitting(true);
    const ok = await save(data, true);
    setSubmitting(false);
    if (ok) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (loadError) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-24 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Link not available</h1>
          <p className="text-neutral-500 mt-2">{loadError}</p>
          <a href={whatsappLink(`Hello ${BUSINESS_NAME}! My details link isn't working. Could you send a new one?`)} className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-sm font-medium">
            <WhatsAppIcon className="w-4 h-4" /> Message us on WhatsApp
          </a>
        </div>
      </div>
    );
  }
  if (!loaded || !data) return <div className="flex-1 flex items-center justify-center text-neutral-400 py-24">Loading your invitation…</div>;

  const doneLink = whatsappLink(`Hello ${BUSINESS_NAME}! I've filled in my wedding details for the ${loaded.template.name} invitation. Please take a look.`);

  return (
    <div className="flex flex-col flex-1">
      <div className="border-b border-neutral-200 bg-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-16 z-30">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-[#b0843a] font-semibold">Your wedding details</p>
          <p className="text-sm font-medium text-neutral-800 truncate">{loaded.template.name} invitation</p>
          <p className="text-xs text-neutral-400 h-4">
            {saveState === "saving" && "Saving…"}
            {saveState === "saved" && "All changes saved"}
            {saveState === "error" && <span className="text-red-500">Not saved</span>}
          </p>
        </div>
        {loaded.editable && (
          <button
            onClick={submit}
            disabled={submitting}
            className="px-5 py-2.5 rounded-full bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : submitted ? "Submit again" : "Submit details"}
          </button>
        )}
      </div>

      {!loaded.editable ? (
        <p className="mx-4 sm:mx-6 mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          Your invitation has been published, so these details can no longer be changed here. Need a change? Message us on WhatsApp.
        </p>
      ) : submitted ? (
        <div className="mx-4 sm:mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex flex-wrap items-center justify-between gap-3">
          <span>
            <b>Thank you! Your details have been sent.</b> We&apos;ll prepare your invitation and share the link with you. You can still make changes here until it&apos;s published.
          </span>
          <a href={doneLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-medium shrink-0">
            <WhatsAppIcon className="w-4 h-4" /> Tell us on WhatsApp
          </a>
        </div>
      ) : (
        <p className="mx-4 sm:mx-6 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Fill in your details and add your photos. Everything saves automatically and the preview updates as you type. Press <b>Submit details</b> when you&apos;re done.
        </p>
      )}
      {error && <p className="text-sm text-red-500 px-4 sm:px-6 pt-3">{error}</p>}

      <UploadAuthProvider value={{ detailsToken: token }}>
        <InvitationEditor componentKey={loaded.template.componentKey} data={data} onChange={update} disabled={!loaded.editable} />
      </UploadAuthProvider>
    </div>
  );
}
