"use client";

import { useEffect, useRef, useState } from "react";
import type { InvitationMusic } from "@/lib/invitation-types";

interface Track {
  id: string;
  title: string;
  mood: string;
  url: string;
}

/**
 * Editor section for the invitation's background song: none, a track from the WedVibe library
 * (with a preview button), or the couple's own MP3/M4A upload.
 */
export function MusicField({ value, onChange }: { value?: InvitationMusic; onChange: (music: InvitationMusic | undefined) => void }) {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rights, setRights] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/music")
      .then((r) => r.json())
      .then((d) => setTracks(d.tracks ?? []))
      .catch(() => setTracks([]));
    return () => audioRef.current?.pause();
  }, []);

  function togglePreview(url: string) {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setPreviewUrl(null);
    }
    const audio = audioRef.current;
    if (previewUrl === url) {
      audio.pause();
      setPreviewUrl(null);
      return;
    }
    audio.src = url;
    audio.volume = 0.7;
    audio.play().then(() => setPreviewUrl(url)).catch(() => setPreviewUrl(null));
  }

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("rightsConfirmed", String(rights));
      const res = await fetch("/api/uploads/audio", { method: "POST", body: form });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return setError(d.error ?? "Unable to upload the song.");
      const title = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 80) || "Our song";
      onChange({ url: d.url, title, source: "upload" });
    } finally {
      setUploading(false);
    }
  }

  const moods = [...new Set((tracks ?? []).map((t) => t.mood))];
  const row = (active: boolean) =>
    `flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
      active ? "border-rose-300 bg-rose-50/70 ring-2 ring-rose-500/15" : "border-neutral-200 bg-white hover:border-neutral-300"
    }`;

  const PlayButton = ({ url, label }: { url: string; label: string }) => (
    <button
      type="button"
      onClick={() => togglePreview(url)}
      aria-label={previewUrl === url ? `Stop preview of ${label}` : `Play preview of ${label}`}
      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs transition-colors ${
        previewUrl === url ? "bg-rose-600 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
      }`}
    >
      {previewUrl === url ? "❚❚" : "▶"}
    </button>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500">
        The song starts softly when a guest opens your invitation, and they can mute it anytime.
      </p>

      <label className={`${row(!value)} cursor-pointer`}>
        <input type="radio" name="music" checked={!value} onChange={() => onChange(undefined)} className="accent-rose-600" />
        <span className="text-sm text-neutral-800">No music</span>
      </label>

      {tracks === null ? (
        <div className="h-24 rounded-xl bg-neutral-100 animate-pulse" />
      ) : tracks.length === 0 ? (
        <p className="text-xs text-neutral-400">Our song library is being prepared. You can upload your own song below.</p>
      ) : (
        moods.map((mood) => (
          <div key={mood}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400 mb-2">{mood}</p>
            <div className="space-y-2">
              {tracks
                .filter((t) => t.mood === mood)
                .map((t) => {
                  const active = value?.url === t.url;
                  return (
                    <div key={t.id} className={row(active)}>
                      <PlayButton url={t.url} label={t.title} />
                      <label className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer">
                        <span className="flex-1 min-w-0 truncate text-sm text-neutral-800">{t.title}</span>
                        <input
                          type="radio"
                          name="music"
                          checked={active}
                          onChange={() => onChange({ url: t.url, title: t.title, source: "library" })}
                          className="accent-rose-600"
                          aria-label={`Use ${t.title}`}
                        />
                      </label>
                    </div>
                  );
                })}
            </div>
          </div>
        ))
      )}

      <div className="rounded-xl border border-dashed border-neutral-300 p-3.5 space-y-3">
        <p className="text-sm font-medium text-neutral-800">Upload your own song</p>
        {value?.source === "upload" && (
          <div className={row(true)}>
            <PlayButton url={value.url} label={value.title} />
            <span className="flex-1 min-w-0 truncate text-sm text-neutral-800">{value.title}</span>
            <button type="button" onClick={() => onChange(undefined)} className="text-xs text-red-500 hover:underline shrink-0">
              Remove
            </button>
          </div>
        )}
        <label className="flex items-start gap-2 text-xs text-neutral-600 cursor-pointer">
          <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} className="mt-0.5 accent-rose-600" />
          <span>I own this song or have permission to use it. Songs reported by the copyright owner may be removed.</span>
        </label>
        <label
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            rights && !uploading ? "border-rose-300 text-rose-700 hover:bg-rose-50 cursor-pointer" : "border-neutral-200 text-neutral-400 cursor-not-allowed"
          }`}
        >
          {uploading ? "Uploading…" : value?.source === "upload" ? "Choose a different song" : "Choose MP3 or M4A"}
          <input
            type="file"
            accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a"
            disabled={!rights || uploading}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = "";
            }}
          />
        </label>
        <p className="text-[11px] text-neutral-400">Up to 8MB.</p>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
