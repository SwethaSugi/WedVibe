"use client";

import { useState } from "react";

export function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads/image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to upload image.");
        return;
      }
      onChange(data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center text-center relative">
      {value && !uploading && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={`Remove ${label}`}
          title={`Remove ${label}`}
          className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-red-500 text-white text-xs shadow-md flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all"
        >
          ✕
        </button>
      )}
      <label className="w-full aspect-square rounded-xl border border-dashed border-neutral-300 flex items-center justify-center text-neutral-300 text-xs cursor-pointer hover:bg-neutral-50 hover:border-rose-300 transition-colors overflow-hidden relative group">
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100">
              {uploading ? "Uploading…" : "Change"}
            </span>
          </>
        ) : (
          <span>{uploading ? "Uploading…" : "+ Photo"}</span>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </label>
      <p className="text-xs text-neutral-500 mt-1.5">{label}</p>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
