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
