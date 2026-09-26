"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UseTemplateButton({ templateId, templateSlug }: { templateId: string; templateSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const meRes = await fetch("/api/auth/me");
      const me = await meRes.json();
      if (!me.user) {
        router.push(`/login?next=/templates/${templateSlug}`);
        return;
      }

      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to start invitation.");
        return;
      }
      router.push(`/editor/${data.invitation.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-6 py-3 rounded-full bg-rose-600 text-white font-medium hover:bg-rose-700 disabled:opacity-60"
      >
        {loading ? "Please wait…" : "Use This Template"}
      </button>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}
