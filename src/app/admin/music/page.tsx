"use client";

import { useEffect, useRef, useState } from "react";
import { AdminShell, AdminPageHeader, AdminPanel, StatusPill, AdminEmpty, AdminLoadingRows, adminTable, adminInput } from "@/components/AdminShell";
import { useAdminFetch } from "@/lib/use-admin-fetch";

interface Track {
  id: string;
  title: string;
  mood: string;
  url: string;
  source: string;
  sourceUrl: string | null;
  license: string | null;
  status: string;
}

const MOODS = ["Shehnai", "Nadaswaram", "Veena", "Sitar", "Flute", "Piano", "Strings", "Romantic", "Festive"];

export default function AdminMusicPage() {
  const adminFetch = useAdminFetch();
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [form, setForm] = useState({ title: "", mood: "", source: "Pixabay Music", sourceUrl: "", license: "Pixabay Content License" });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function load() {
    adminFetch("/api/admin/music")
      .then((r) => r.json())
      .then((d) => setTracks(d.tracks ?? []))
      .catch(() => setTracks([]));
  }
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => audioRef.current?.pause(), []);

  function togglePreview(t: Track) {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setPreviewId(null);
    }
    const audio = audioRef.current;
    if (previewId === t.id) {
      audio.pause();
      setPreviewId(null);
      return;
    }
    audio.src = t.url;
    audio.play().then(() => setPreviewId(t.id)).catch(() => setPreviewId(null));
  }

  async function addTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setNote({ ok: false, text: "Choose an MP3 or M4A file." });
    setSaving(true);
    setNote(null);
    const body = new FormData();
    body.append("file", file);
    Object.entries(form).forEach(([k, v]) => body.append(k, v));
    const res = await adminFetch("/api/admin/music", { method: "POST", body });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setNote({ ok: false, text: d.error ?? "Unable to add the song." });
    setNote({ ok: true, text: `"${d.track.title}" added to the library.` });
    setForm((f) => ({ ...f, title: "", sourceUrl: "" }));
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
    load();
  }

  async function setStatus(t: Track, status: "ACTIVE" | "INACTIVE") {
    await adminFetch(`/api/admin/music/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const activeCount = tracks?.filter((t) => t.status === "ACTIVE").length ?? 0;
  const label = "block text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500 mb-1.5";

  return (
    <AdminShell>
      <AdminPageHeader
        title="Music Library"
        subtitle={tracks ? `${tracks.length} songs · ${activeCount} offered to couples in the editor` : "Loading…"}
      />

      <AdminPanel className="mb-6 p-5 sm:p-6">
        <p className="font-semibold text-neutral-900">Add a song</p>
        <p className="text-sm text-neutral-500 mt-0.5">
          Use only royalty-free music you&apos;re allowed to use commercially (e.g. Pixabay Music). Keep the source link so every
          song&apos;s licence can be shown if asked.
        </p>
        <form onSubmit={addTrack} className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={label}>Song file (MP3 or M4A, up to 15MB)</label>
            <input
              ref={fileInput}
              type="file"
              accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                if (f && !form.title) setForm((s) => ({ ...s, title: f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 80) }));
              }}
              className="block w-full text-sm text-neutral-600 file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-[#f6ede3] file:text-neutral-800 file:font-medium hover:file:bg-[#efe1d1]"
            />
          </div>
          <div>
            <label className={label}>Title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Shehnai Welcome" className={`${adminInput} w-full`} />
          </div>
          <div>
            <label className={label}>Mood / instrument</label>
            <input required list="music-moods" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} placeholder="e.g. Shehnai" className={`${adminInput} w-full`} />
            <datalist id="music-moods">
              {MOODS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={label}>Source</label>
            <input required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={`${adminInput} w-full`} />
          </div>
          <div className="lg:col-span-2">
            <label className={label}>Source link</label>
            <input type="url" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://pixabay.com/music/…" className={`${adminInput} w-full`} />
          </div>
          <div>
            <label className={label}>Licence</label>
            <input value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} className={`${adminInput} w-full`} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#c99534] to-[#a8761f] text-white shadow-sm hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Uploading…" : "Add to library"}
            </button>
            {note && <p className={`text-sm ${note.ok ? "text-emerald-600" : "text-red-500"}`}>{note.text}</p>}
          </div>
        </form>
      </AdminPanel>

      <AdminPanel>
        {tracks === null ? (
          <AdminLoadingRows />
        ) : tracks.length === 0 ? (
          <AdminEmpty icon="♪" title="No songs yet" hint="Add your first royalty-free song above. Couples will see it in the editor." />
        ) : (
          <div className={adminTable.wrap}>
            <table className={adminTable.table}>
              <thead className={adminTable.thead}>
                <tr>
                  <th className={adminTable.th}>Song</th>
                  <th className={adminTable.th}>Mood</th>
                  <th className={adminTable.th}>Source</th>
                  <th className={adminTable.th}>Status</th>
                  <th className={`${adminTable.th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((t) => (
                  <tr key={t.id} className={adminTable.tr}>
                    <td className={adminTable.td}>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => togglePreview(t)}
                          aria-label={previewId === t.id ? `Stop ${t.title}` : `Play ${t.title}`}
                          className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs ${
                            previewId === t.id ? "bg-[#c99534] text-white" : "bg-[#f6ede3] text-neutral-800 hover:bg-[#efe1d1]"
                          }`}
                        >
                          {previewId === t.id ? "❚❚" : "▶"}
                        </button>
                        <span className="font-medium text-neutral-900">{t.title}</span>
                      </div>
                    </td>
                    <td className={`${adminTable.td} text-neutral-600`}>{t.mood}</td>
                    <td className={`${adminTable.td} text-neutral-500`}>
                      {t.sourceUrl ? (
                        <a href={t.sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-neutral-800">
                          {t.source}
                        </a>
                      ) : (
                        t.source
                      )}
                      {t.license && <span className="block text-[11px] text-neutral-400">{t.license}</span>}
                    </td>
                    <td className={adminTable.td}>
                      <StatusPill status={t.status} />
                    </td>
                    <td className={`${adminTable.td} text-right`}>
                      <button
                        onClick={() => setStatus(t, t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                        title={t.status === "ACTIVE" ? "Hide from the editor. Couples already using it keep it." : "Offer in the editor again"}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          t.status === "ACTIVE" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {t.status === "ACTIVE" ? "Hide" : "Show"}
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
