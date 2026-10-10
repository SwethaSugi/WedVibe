"use client";

import { useState } from "react";

/** Opens the phone's share sheet (WhatsApp, Instagram…) or copies the link on desktop. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // dismissed: fall through to copying
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button
      onClick={share}
      className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-colors ${
        copied ? "bg-emerald-50 text-emerald-700" : "bg-[#5b1530] text-white hover:bg-[#7a1f3d]"
      }`}
    >
      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 7l-4-4-4 4M10 3v10M4 11v4a2 2 0 002 2h8a2 2 0 002-2v-4" />
      </svg>
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
