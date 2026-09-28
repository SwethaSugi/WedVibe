// Object storage abstraction for uploaded images. Set STORAGE_PROVIDER to plug in
// S3 / Cloudinary / Azure Blob / Supabase Storage. In "local" mode files are written
// under public/uploads, which is fine for development but not for production.

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG or WebP.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Image size is too large. Maximum 5MB.");
  }

  const provider = process.env.STORAGE_PROVIDER ?? "local";
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${nanoid(16)}.${ext}`;

  if (provider === "local") {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);
    return `/uploads/${filename}`;
  }

  throw new Error(`Storage provider not implemented: ${provider}`);
}

// Background music for invitations (MP3 or M4A). The browser-supplied type can be anything, so
// the file's first bytes are checked too: MP3 starts with an ID3 tag or an MPEG frame sync, M4A
// has "ftyp" at byte 4.
function detectAudio(bytes: Buffer): "mp3" | "m4a" | null {
  if (bytes.length < 12) return null;
  if (bytes.toString("latin1", 0, 3) === "ID3") return "mp3";
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return "mp3";
  if (bytes.toString("latin1", 4, 8) === "ftyp") return "m4a";
  return null;
}

export const MAX_MUSIC_BYTES_CUSTOMER = 8 * 1024 * 1024; // 8MB
export const MAX_MUSIC_BYTES_ADMIN = 15 * 1024 * 1024; // 15MB

export async function saveUploadedAudio(file: File, maxBytes: number): Promise<string> {
  if (file.size > maxBytes) {
    throw new Error(`Song is too large. Maximum ${Math.round(maxBytes / 1024 / 1024)}MB.`);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = detectAudio(buffer);
  if (!ext) {
    throw new Error("Unsupported song file. Please upload an MP3 or M4A file.");
  }

  const provider = process.env.STORAGE_PROVIDER ?? "local";
  const filename = `${nanoid(16)}.${ext}`;

  if (provider === "local") {
    const dir = path.join(process.cwd(), "public", "uploads", "music");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    return `/uploads/music/${filename}`;
  }

  throw new Error(`Storage provider not implemented: ${provider}`);
}
