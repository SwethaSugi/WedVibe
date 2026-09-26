"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "mt-1.5 w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#e2b75a]/50 focus:border-[#d9b36a]";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid credentials.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 min-h-screen grid lg:grid-cols-2 bg-[#140d0e] text-white">
      {/* Photo side (Pexels #20172658, free licence) */}
      <div className="relative hidden lg:block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/defaults/featured-rings-silver.jpg" alt="" aria-hidden className="wv-hero-drift absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#140d0e] to-transparent" />
        <div className="absolute bottom-12 left-12 right-24">
          <p className="text-xs uppercase tracking-[0.3em] text-[#f3d68a]">WedVibe Admin</p>
          <p className="mt-3 text-3xl font-semibold leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            Manage templates, invitations and payments — all in one place.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="relative flex items-center justify-center px-6 py-16 overflow-hidden">
        <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-rose-700/25 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-10 w-80 h-80 rounded-full bg-amber-600/15 blur-3xl" aria-hidden />

        <div className="relative w-full max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-rings.jpg"
            alt=""
            className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-[#d9b36a]/60 shadow-[0_0_30px_rgba(217,179,106,0.25)]"
            style={{ objectPosition: "42% 58%" }}
          />
          <h1 className="text-2xl font-semibold text-center mt-5">WedVibe Admin</h1>
          <p className="text-sm text-white/55 text-center mt-1">Sign in to manage the platform</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-3xl bg-white/[0.04] border border-white/10 p-6 backdrop-blur-sm">
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-white/60">Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" className={inputClass} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-white/60">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={inputClass}
              />
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#f3d68a] via-[#e2b75a] to-[#c99534] text-[#2b1a0c] font-semibold shadow-[0_10px_30px_rgba(201,149,52,0.3)] hover:brightness-110 disabled:opacity-60 transition"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
