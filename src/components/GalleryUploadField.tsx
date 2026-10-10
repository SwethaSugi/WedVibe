"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/upload-client";
import { useUploadAuth } from "@/components/UploadAuth";

const MAX_IMAGES = 3;

export function GalleryUploadField({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const { detailsToken } = useUploadAuth();
  const remaining = MAX_IMAGES - images.length;

  async function handleFiles(files: FileList) {
    setUploading(true);
    setError("");
    try {
      const toUpload = Array.from(files).slice(0, remaining);
      if (files.length > toUpload.length) {
        setError(`You can add up to ${MAX_IMAGES} gallery images.`);
      }
      const uploaded: string[] = [];
      for (const file of toUpload) {
        try {
          uploaded.push(await uploadFile(file, "image", { detailsToken }));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unable to upload one or more images.");
        }
      }
      if (uploaded.length) onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }

  function removeAt(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Gallery Images</label>
        <span className="text-xs text-neutral-400">{images.length}/{MAX_IMAGES}</span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {images.map((src, idx) => (
          <div key={idx} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="w-full h-20 object-cover rounded-lg border border-neutral-200" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
        {remaining > 0 && (
          <label className="w-full h-20 rounded-lg border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-xs cursor-pointer hover:bg-neutral-50">
            {uploading ? "Uploading…" : "+ Add"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      {remaining === 0 && <p className="text-xs text-neutral-400 mt-1">Maximum of {MAX_IMAGES} gallery images reached.</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
