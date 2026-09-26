"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Step = "mobile" | "pin" | "otp" | "name" | "setPin";

const inputClass =
  "mt-1 w-full border border-neutral-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500";
const pinInputClass = `${inputClass} tracking-[0.5em] text-center text-lg`;
const primaryButton =
  "w-full py-2.5 rounded-full bg-rose-600 text-white font-medium hover:bg-rose-700 disabled:opacity-60";

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/dashboard";

  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [name, setName] = useState("");
  const [forgotPin, setForgotPin] = useState(false);
  const [needsPin, setNeedsPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  function finish() {
    router.push(next);
    router.refresh();
  }

  function goTo(nextStep: Step) {
    setError("");
    setStep(nextStep);
  }

  async function continueWithMobile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { ok, data } = await postJson("/api/auth/lookup", { mobile });
      if (!ok) return setError(data.error ?? "Please enter a valid mobile number.");
      setMobile(data.mobile);
      if (data.hasPin) {
        setForgotPin(false);
        goTo("pin");
      } else {
        await sendOtp(data.mobile);
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp(number = mobile) {
    setError("");
    setLoading(true);
    try {
      const { ok, data } = await postJson("/api/auth/send-otp", { mobile: number });
      if (!ok) return setError(data.error ?? "Unable to send OTP. Please try again.");
      setOtp("");
      setDevOtp(data.devOtp ?? null);
      setResendIn(data.resendInSeconds ?? 30);
      goTo("otp");
    } finally {
      setLoading(false);
    }
  }

  async function loginWithPin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { ok, data } = await postJson("/api/auth/pin-login", { mobile, pin });
      if (!ok) {
        setPin("");
        return setError(data.error ?? "Incorrect PIN.");
      }
      finish();
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { ok, data } = await postJson("/api/auth/verify-otp", { mobile, otp });
      if (!ok) return setError(data.error ?? "Invalid OTP.");
      const mustSetPin = forgotPin || !data.user?.hasPin;
      setNeedsPin(mustSetPin);
      if (!data.user?.name) return goTo("name");
      if (mustSetPin) return goTo("setPin");
      finish();
    } finally {
      setLoading(false);
    }
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setError(data.error ?? "Unable to save your name.");
      if (needsPin) return goTo("setPin");
      finish();
    } finally {
      setLoading(false);
    }
  }

  async function savePin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPin !== confirmPin) return setError("The two PINs don't match.");
    setLoading(true);
    try {
      const { ok, data } = await postJson("/api/auth/pin", { pin: newPin });
      if (!ok) return setError(data.error ?? "Unable to save your PIN.");
      finish();
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Step, { title: string; subtitle: string }> = {
    mobile: { title: "Login to WedVibe", subtitle: "Enter your WhatsApp number to continue." },
    pin: { title: "Welcome back!", subtitle: `Enter your PIN for ${mobile}.` },
    otp: { title: "Verify your number", subtitle: `We sent a 6-digit code to ${mobile} on WhatsApp.` },
    name: { title: "You're verified!", subtitle: "What should we call you?" },
    setPin: {
      title: forgotPin ? "Set a new PIN" : "Create your PIN",
      subtitle: "Use this 4–6 digit PIN to log in next time — no OTP needed.",
    },
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-16 sm:py-20 w-full">
      <h1 className="text-2xl font-semibold text-center">{titles[step].title}</h1>
      <p className="text-sm text-neutral-500 text-center mt-2">{titles[step].subtitle}</p>

      {step === "mobile" && (
        <form onSubmit={continueWithMobile} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">WhatsApp Mobile Number</label>
            <input
              type="tel"
              required
              autoFocus
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className={primaryButton}>
            {loading ? "Please wait…" : "Continue"}
          </button>
        </form>
      )}

      {step === "pin" && (
        <form onSubmit={loginWithPin} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              required
              autoFocus
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className={pinInputClass}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading || pin.length < 4} className={primaryButton}>
            {loading ? "Logging in…" : "Login"}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setForgotPin(true);
                sendOtp();
              }}
              disabled={loading}
              className="text-rose-600 hover:underline disabled:opacity-50"
            >
              Forgot PIN?
            </button>
            <button type="button" onClick={() => goTo("mobile")} className="text-neutral-500 hover:underline">
              Change number
            </button>
          </div>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} className="mt-8 space-y-4">
          {devOtp && (
            // Only returned by the server in local test mode; never shown once a real WhatsApp provider is set.
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm flex items-center justify-between gap-3">
              <p className="text-amber-800">
                Test code: <span className="font-mono font-semibold tracking-widest">{devOtp}</span>
              </p>
              <button type="button" onClick={() => setOtp(devOtp)} className="text-xs font-medium text-amber-800 underline shrink-0">
                Use code
              </button>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Enter OTP</label>
            <input
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              className={`${inputClass} tracking-widest text-center text-lg`}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading || otp.length !== 6} className={primaryButton}>
            {loading ? "Verifying…" : "Verify OTP"}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              disabled={resendIn > 0 || loading}
              onClick={() => sendOtp()}
              className="text-neutral-500 disabled:opacity-50 hover:underline"
            >
              {resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}
            </button>
            <button type="button" onClick={() => goTo("mobile")} className="text-neutral-500 hover:underline">
              Change number
            </button>
          </div>
        </form>
      )}

      {step === "name" && (
        <form onSubmit={saveName} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Your Name</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading || !name.trim()} className={primaryButton}>
            {loading ? "Saving…" : "Continue"}
          </button>
        </form>
      )}

      {step === "setPin" && (
        <form onSubmit={savePin} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">New PIN</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              required
              autoFocus
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
              placeholder="4–6 digits"
              className={pinInputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm PIN</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              required
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Re-enter PIN"
              className={pinInputClass}
            />
          </div>
          <p className="text-xs text-neutral-400">Avoid easy PINs like 1111 or 1234.</p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading || newPin.length < 4 || confirmPin.length < 4} className={primaryButton}>
            {loading ? "Saving…" : "Save PIN & Continue"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
