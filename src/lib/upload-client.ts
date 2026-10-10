import { upload } from "@vercel/blob/client";

export type UploadKind = "image" | "music" | "admin-music";

let modePromise: Promise<"blob" | "local"> | null = null;
function storageMode() {
  modePromise ??= fetch("/api/uploads/mode")
    .then((r) => r.json())
    .then((d) => (d.mode === "blob" ? "blob" : "local"))
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
 * Vercel Blob and the server then checks it; locally it goes through /api/uploads/local.
 * Throws an Error with a message suitable to show the user.
 */
export async function uploadFile(
  file: File,
  kind: UploadKind,
  opts: { rightsConfirmed?: boolean; detailsToken?: string } = {}
): Promise<string> {
  const rightsConfirmed = !!opts.rightsConfirmed;
  const detailsToken = opts.detailsToken;

  if ((await storageMode()) === "local") {
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
