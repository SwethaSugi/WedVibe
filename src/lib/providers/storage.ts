// Upload storage for couple photos, couple songs and the admin music library.
//   "blob"  — Vercel Blob, used whenever BLOB_READ_WRITE_TOKEN is set (production on Vercel).
//             Browsers upload straight to Blob (Vercel functions cap request bodies at 4.5MB);
//             the server issues a short-lived upload token, then checks the stored file.
//   "local" — files written under public/uploads, for local development only.
// Either way the file's first bytes are checked, because the browser-supplied type can be anything.

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { del } from "@vercel/blob";

export type UploadKind = "image" | "music" | "admin-music";

interface UploadRule {
  folder: "images" | "music";
  maxBytes: number;
  contentTypes: string[];
  tooLarge: string;
  wrongType: string;
}

export const UPLOAD_RULES: Record<UploadKind, UploadRule> = {
  image: {
    folder: "images",
    maxBytes: 5 * 1024 * 1024,
    contentTypes: ["image/jpeg", "image/png", "image/webp"],
    tooLarge: "Image size is too large. Maximum 5MB.",
    wrongType: "Unsupported image type. Use JPEG, PNG or WebP.",
  },
  music: {
    folder: "music",
    maxBytes: 8 * 1024 * 1024,
    contentTypes: ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a"],
    tooLarge: "Song is too large. Maximum 8MB.",
    wrongType: "Unsupported song file. Please upload an MP3 or M4A file.",
  },
  "admin-music": {
    folder: "music",
    maxBytes: 15 * 1024 * 1024,
    contentTypes: ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a"],
    tooLarge: "Song is too large. Maximum 15MB.",
    wrongType: "Unsupported song file. Please upload an MP3 or M4A file.",
  },
};

export function isUploadKind(value: unknown): value is UploadKind {
  return value === "image" || value === "music" || value === "admin-music";
}

export function storageMode(): "blob" | "local" {
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
}

/** Public hostname of this project's Blob store, derived from its read-write token. */
export function blobHost(): string | null {
  const m = /^vercel_blob_rw_([A-Za-z0-9]+)_/.exec(process.env.BLOB_READ_WRITE_TOKEN ?? "");
  return m ? `${m[1].toLowerCase()}.public.blob.vercel-storage.com` : null;
}

/** File extension for real image/audio bytes, or null. */
export function detectFile(bytes: Uint8Array, folder: UploadRule["folder"]): string | null {
  if (bytes.length < 12) return null;
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (folder === "images") {
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
    if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "png";
    if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
    return null;
  }
  if (ascii(0, 3) === "ID3") return "mp3";
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return "mp3";
  if (ascii(4, 8) === "ftyp") return "m4a";
  return null;
}

/** Local mode: validates and writes the file under public/uploads, returning its URL. */
export async function saveLocalUpload(file: File, kind: UploadKind): Promise<string> {
  const rule = UPLOAD_RULES[kind];
  if (file.size > rule.maxBytes) throw new Error(rule.tooLarge);
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = detectFile(buffer, rule.folder);
  if (!ext) throw new Error(rule.wrongType);

  // Images keep their original location (/uploads/<file>) so existing links stay valid.
  const sub = rule.folder === "music" ? "music" : "";
  const dir = path.join(process.cwd(), "public", "uploads", sub);
  await mkdir(dir, { recursive: true });
  const filename = `${nanoid(16)}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);
  return sub ? `/uploads/${sub}/${filename}` : `/uploads/${filename}`;
}

/** True when the URL points at a file this site stored for the given kind. */
export function isOwnUploadUrl(url: string, kind: UploadKind): boolean {
  const folder = UPLOAD_RULES[kind].folder;
  const local = folder === "music" ? /^\/uploads\/music\/[A-Za-z0-9_-]+\.(mp3|m4a)$/ : /^\/uploads\/[A-Za-z0-9_-]+\.(jpg|png|webp)$/;
  if (local.test(url)) return true;
  const host = blobHost();
  if (!host) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname === host && u.pathname.startsWith(`/${folder}/`);
  } catch {
    return false;
  }
}

/**
 * Blob mode: after the browser uploads, confirm the stored file really is an image/song of the
 * right size. Anything else is deleted from the store and rejected.
 */
export async function verifyBlobUpload(url: string, kind: UploadKind): Promise<string> {
  const rule = UPLOAD_RULES[kind];
  if (!isOwnUploadUrl(url, kind) || url.startsWith("/")) throw new Error("Upload not found.");

  const res = await fetch(url, { headers: { Range: "bytes=0-31" }, cache: "no-store" });
  const range = res.headers.get("content-range"); // "bytes 0-31/12345"
  const total = range ? Number(range.split("/")[1]) : Number(res.headers.get("content-length") ?? 0);
  const bytes = new Uint8Array(await res.arrayBuffer()).slice(0, 32);

  let problem: string | null = null;
  if (!res.ok) problem = "Upload not found.";
  else if (total > rule.maxBytes) problem = rule.tooLarge;
  else if (!detectFile(bytes, rule.folder)) problem = rule.wrongType;

  if (problem) {
    await del(url).catch(() => {});
    throw new Error(problem);
  }
  return url;
}
