import { upload } from "@vercel/blob/client";

export type UploadKind = "image" | "music" | "admin-music";

type Mode = "blob" | "netlify" | "local";

let modePromise: Promise<Mode> | null = null;
function storageMode() {
  modePromise ??= fetch("/api/uploads/mode")
    .then((r) => r.json())
    .then((d): Mode => (d.mode === "blob" || d.mode === "netlify" ? d.mode : "local"))
    .catch(() => {
      modePromise = null;
      return "local" as const;
    });
  return modePromise;
}

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
};

/**
 * Uploads a photo or song and returns its URL. On Vercel the browser sends the file straight to
 * Vercel Blob and the server then checks it; on Netlify it goes to /api/uploads/part in parts;
 * locally it goes through /api/uploads/local.
 * Throws an Error with a message suitable to show the user.
 */
export async function uploadFile(
  file: File,
  kind: UploadKind,
  opts: { rightsConfirmed?: boolean; detailsToken?: string } = {}
): Promise<string> {
  const rightsConfirmed = !!opts.rightsConfirmed;
  const detailsToken = opts.detailsToken;
  const mode = await storageMode();

  if (mode === "netlify") {
    // Sent in 4MB parts (must match UPLOAD_PART_BYTES in storage.ts).
    const PART = 4 * 1024 * 1024;
    const uploadId = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("");
    const count = Math.max(1, Math.ceil(file.size / PART));
    for (let i = 0; i < count; i++) {
      const form = new FormData();
      form.append("part", file.slice(i * PART, (i + 1) * PART), file.name);
      form.append("kind", kind);
      form.append("uploadId", uploadId);
      form.append("index", String(i));
      form.append("last", String(i === count - 1));
      form.append("rightsConfirmed", String(rightsConfirmed));
      if (detailsToken) form.append("detailsToken", detailsToken);
      const res = await fetch("/api/uploads/part", { method: "POST", body: form });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Upload failed. Please try again.");
      if (i === count - 1) {
        if (!d.url) throw new Error("Upload failed. Please try again.");
        return d.url;
      }
    }
  }

  if (mode === "local") {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    form.append("rightsConfirmed", String(rightsConfirmed));
    if (detailsToken) form.append("detailsToken", detailsToken);
    const res = await fetch("/api/uploads/local", { method: "POST", body: form });
    const d = await res.json().catch(() => ({}));
    if (!res.ok || !d.url) throw new Error(d.error ?? "Upload failed. Please try again.");
    return d.url;
  }

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  const folder = kind === "image" ? "images" : "music";
  const allowed = kind === "image" ? ["jpg", "jpeg", "png", "webp"] : ["mp3", "m4a"];
  if (!allowed.includes(ext)) {
    throw new Error(kind === "image" ? "Unsupported image type. Use JPEG, PNG or WebP." : "Please upload an MP3 or M4A file.");
  }
  const base = file.name.slice(0, -(ext.length + 1)).replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "file";

  let url: string;
  try {
    const blob = await upload(`${folder}/${base}.${ext}`, file, {
      access: "public",
      handleUploadUrl: "/api/uploads/blob",
      clientPayload: JSON.stringify({ kind, rightsConfirmed, detailsToken }),
      contentType: CONTENT_TYPES[ext],
    });
    url = blob.url;
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    throw new Error(/size|large|exceed/i.test(message) ? "File is too large." : message.replace(/^Vercel Blob: /, "") || "Upload failed. Please try again.");
  }

  const res = await fetch("/api/uploads/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, kind, rightsConfirmed, detailsToken }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || !d.url) throw new Error(d.error ?? "Upload failed. Please try again.");
  return d.url;
}
