"use client";

import { useState, type ReactNode } from "react";
import { nanoid } from "nanoid";
import type { InvitationData, InvitationEvent } from "@/lib/invitation-types";
import { TemplateRenderer } from "@/templates/renderer";
import { ImageUploadField } from "@/components/ImageUploadField";
import { GalleryUploadField } from "@/components/GalleryUploadField";
import { MusicField } from "@/components/MusicField";

/**
 * The invitation details form with a live template preview beside it. Shared by the couple's own
 * editor, the admin invitation builder and the customer details-form link, so all three always
 * offer the same fields. The page owns saving; this only reports changes through onChange.
 */
export function InvitationEditor({
  componentKey,
  data,
  onChange,
  disabled = false,
}: {
  componentKey: string;
  data: InvitationData;
  onChange: (patch: Partial<InvitationData>) => void;
  disabled?: boolean;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const update = onChange;

  function updateEvent(id: string, patch: Partial<InvitationEvent>) {
    update({ events: data.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  }

  function addEvent() {
    update({ events: [...data.events, { id: nanoid(8), eventName: "New Event" }] });
  }

  function removeEvent(id: string) {
    update({ events: data.events.filter((e) => e.id !== id) });
  }

  function moveEvent(id: string, direction: -1 | 1) {
    const events = [...data.events];
    const idx = events.findIndex((e) => e.id === id);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= events.length) return;
    [events[idx], events[swapIdx]] = [events[swapIdx], events[idx]];
    update({ events });
  }

  return (
        <div className="flex flex-1 flex-col lg:flex-row min-h-0">
          <fieldset
            disabled={disabled}
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

          <div className="flex-1 bg-neutral-100 flex flex-col items-center px-3 py-6 sm:py-8 overflow-y-auto">
            <div className="hidden lg:flex mb-5 rounded-full border border-neutral-300 overflow-hidden text-sm bg-white">
              {(["desktop", "mobile"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  className={`px-3 py-1.5 capitalize ${device === d ? "bg-neutral-900 text-white" : "hover:bg-neutral-50"}`}
                >
                  {d}
                </button>
              ))}
            </div>
            {/* `isolate`: keep the template's z-indexed layers from painting over the sticky bars */}
            <div className={`relative isolate max-w-full overflow-hidden shadow-2xl border border-neutral-200 rounded-3xl transition-all ${device === "mobile" ? "w-[390px]" : "w-[480px]"}`}>
              <TemplateRenderer componentKey={componentKey} data={data} />
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
