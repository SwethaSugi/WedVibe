"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { InvitationData, InvitationEvent } from "@/lib/invitation-types";
import { TemplateRenderer } from "@/templates/renderer";
import { ImageUploadField } from "@/components/ImageUploadField";
import { GalleryUploadField } from "@/components/GalleryUploadField";
import { MusicField } from "@/components/MusicField";
import type { EditInfo } from "@/lib/edit-policy";

interface LoadedInvitation {
  id: string;
  slug: string;
  status: string;
  data: InvitationData;
  editInfo: EditInfo;
  template: { id: string; name: string; componentKey: string; price: number; currency: string };
}

type Device = "desktop" | "mobile";

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invitationId = params.id;

  const [invitation, setInvitation] = useState<LoadedInvitation | null>(null);
  const [data, setData] = useState<InvitationData | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
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

  function updateEvent(id: string, patch: Partial<InvitationEvent>) {
    update({ events: (data?.events ?? []).map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  }

  function addEvent() {
    update({ events: [...(data?.events ?? []), { id: nanoid(8), eventName: "New Event" }] });
  }

  function removeEvent(id: string) {
    update({ events: (data?.events ?? []).filter((e) => e.id !== id) });
  }

  function moveEvent(id: string, direction: -1 | 1) {
    const events = [...(data?.events ?? [])];
    const idx = events.findIndex((e) => e.id === id);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= events.length) return;
    [events[idx], events[swapIdx]] = [events[swapIdx], events[idx]];
    update({ events });
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
          <div className="hidden lg:flex rounded-full border border-neutral-300 overflow-hidden text-sm">
            <button
              onClick={() => setDevice("desktop")}
              className={`px-3 py-1.5 ${device === "desktop" ? "bg-neutral-900 text-white" : "hover:bg-neutral-50"}`}
            >
              Desktop
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`px-3 py-1.5 ${device === "mobile" ? "bg-neutral-900 text-white" : "hover:bg-neutral-50"}`}
            >
              Mobile
            </button>
          </div>
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

      <div className="flex flex-1 flex-col lg:flex-row min-h-0">
        <fieldset
          disabled={isInactive || editingClosed}
          className="lg:w-[440px] min-w-0 shrink-0 overflow-y-auto bg-neutral-50 border-r border-neutral-200 p-5 space-y-5 disabled:opacity-60"
        >
          <SectionCard icon="💑" title="Couple Details">
            <Field
              label="Groom Name"
              required
              value={data.groomName}
              onChange={(v) => update({ groomName: v })}
              placeholder="e.g. Arjun Kumar"
            />
            <Field
              label="Bride Name"
              required
              value={data.brideName}
              onChange={(v) => update({ brideName: v })}
              placeholder="e.g. Divya Sharma"
            />
            <div className="grid grid-cols-3 gap-3 pt-1">
              <ImageUploadField label="Groom Photo" value={data.groomImage} onChange={(url) => update({ groomImage: url })} />
              <ImageUploadField label="Bride Photo" value={data.brideImage} onChange={(url) => update({ brideImage: url })} />
              <ImageUploadField label="Couple Photo" value={data.coupleImage} onChange={(url) => update({ coupleImage: url })} />
            </div>
          </SectionCard>

          <SectionCard icon="📅" title="Wedding Details">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Wedding Date" required type="date" value={data.weddingDate} onChange={(v) => update({ weddingDate: v })} />
              <Field label="Wedding Time" value={data.weddingTime} onChange={(v) => update({ weddingTime: v })} placeholder="e.g. 09:00 AM" />
            </div>
            <Field
              label="Venue Name"
              required
              value={data.venueName}
              onChange={(v) => update({ venueName: v })}
              placeholder="e.g. Taj Banquet Hall"
            />
            <Field
              label="Venue Address"
              value={data.venueAddress}
              onChange={(v) => update({ venueAddress: v })}
              placeholder="e.g. Chennai, Tamil Nadu"
              textarea
            />
            <Field
              label="Google Maps Link"
              value={data.googleMapsUrl ?? ""}
              onChange={(v) => update({ googleMapsUrl: v })}
              placeholder="Paste your venue's Google Maps link"
            />
          </SectionCard>

          <SectionCard icon="💌" title="Welcome Message">
            <Field
              label="Message"
              value={data.welcomeMessage}
              onChange={(v) => update({ welcomeMessage: v })}
              placeholder="We warmly invite you to celebrate our special day with us."
              textarea
            />
          </SectionCard>

          <SectionCard icon="📖" title="Our Story" optional>
            <Field
              label="How you met, the proposal, or anything you'd like to share"
              value={data.loveStory ?? ""}
              onChange={(v) => update({ loveStory: v })}
              placeholder="We met at a coffee shop in 2021…"
              textarea
            />
          </SectionCard>

          <SectionCard icon="🖼️" title="Photo Gallery" optional>
            <GalleryUploadField images={data.galleryImages ?? []} onChange={(images) => update({ galleryImages: images })} />
          </SectionCard>

          <SectionCard icon="🎉" title="Events">
            <div className="space-y-3">
              {data.events.map((e, idx) => (
                <div key={e.id} className="border border-neutral-200 rounded-xl p-3 space-y-2 bg-neutral-50">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      value={e.eventName}
                      onChange={(ev) => updateEvent(e.id, { eventName: ev.target.value })}
                      placeholder="Event name"
                      className="font-medium text-sm bg-transparent border-b border-transparent focus:border-rose-400 focus:outline-none flex-1 py-0.5"
                    />
                    <div className="flex items-center gap-2 text-neutral-400">
                      <button
                        type="button"
                        onClick={() => moveEvent(e.id, -1)}
                        disabled={idx === 0}
                        aria-label="Move event up"
                        className="px-2 h-6 rounded-full text-xs font-medium hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveEvent(e.id, 1)}
                        disabled={idx === data.events.length - 1}
                        aria-label="Move event down"
                        className="px-2 h-6 rounded-full text-xs font-medium hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEvent(e.id)}
                        className="w-6 h-6 rounded-full text-red-400 hover:bg-red-50 hover:text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={e.eventDate ?? ""}
                      onChange={(ev) => updateEvent(e.id, { eventDate: ev.target.value })}
                      className="text-xs border border-neutral-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
                    />
                    <input
                      placeholder="Time, e.g. 10:00 AM"
                      value={e.eventTime ?? ""}
                      onChange={(ev) => updateEvent(e.id, { eventTime: ev.target.value })}
                      className="text-xs border border-neutral-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
                    />
                  </div>
                  <input
                    placeholder="Venue (optional)"
                    value={e.venue ?? ""}
                    onChange={(ev) => updateEvent(e.id, { venue: ev.target.value })}
                    className="w-full text-xs border border-neutral-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addEvent}
                className="w-full text-sm font-medium text-rose-600 border border-dashed border-rose-300 rounded-xl py-2.5 hover:bg-rose-50 transition-colors"
              >
                + Add Event
              </button>
            </div>
          </SectionCard>

          <SectionCard icon="👪" title="Family Details" optional>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Groom's Father" value={data.groomFatherName ?? ""} onChange={(v) => update({ groomFatherName: v })} />
              <Field label="Groom's Mother" value={data.groomMotherName ?? ""} onChange={(v) => update({ groomMotherName: v })} />
              <Field label="Bride's Father" value={data.brideFatherName ?? ""} onChange={(v) => update({ brideFatherName: v })} />
              <Field label="Bride's Mother" value={data.brideMotherName ?? ""} onChange={(v) => update({ brideMotherName: v })} />
            </div>
          </SectionCard>

          <SectionCard icon="✨" title="Additional Content" optional>
            <Field label="Quote" value={data.quote ?? ""} onChange={(v) => update({ quote: v })} placeholder="A quote about love…" />
            <Field
              label="Contact Details"
              value={data.contactDetails ?? ""}
              onChange={(v) => update({ contactDetails: v })}
              placeholder="+91 98765 43210"
            />
            <Field
              label="Instagram Link"
              value={data.instagramLink ?? ""}
              onChange={(v) => update({ instagramLink: v })}
              placeholder="https://instagram.com/yourhandle"
            />
          </SectionCard>

          <SectionCard icon="🎵" title="Background Music" optional>
            <MusicField value={data.music} onChange={(music) => update({ music })} />
          </SectionCard>
        </fieldset>

        <div className="flex-1 bg-neutral-100 flex items-start justify-center px-3 py-6 sm:py-10 overflow-y-auto">
          {/* `isolate`: keep the template's z-indexed layers from painting over the sticky bars */}
          <div className={`relative isolate max-w-full overflow-hidden shadow-2xl border border-neutral-200 rounded-3xl transition-all ${device === "mobile" ? "w-[390px]" : "w-[480px]"}`}>
            <TemplateRenderer componentKey={invitation.template.componentKey} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  optional = false,
  children,
}: {
  icon: string;
  title: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none">{icon}</span>
        <h2 className="font-semibold text-neutral-800">{title}</h2>
        {optional && (
          <span className="text-[10px] uppercase tracking-wide font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
            Optional
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
  required?: boolean;
}) {
  const inputClasses =
    "mt-1.5 w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm bg-white placeholder:text-neutral-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400";

  return (
    <div>
      <label className="text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={inputClasses}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
    </div>
  );
}
