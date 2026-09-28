"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

type Step = "mobile" | "pin" | "otp" | "name" | "setPin";

const labelClass = "block text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2";
const fieldShell =
  "flex items-center rounded-2xl border border-[#e8ddd3] bg-white/80 shadow-[inset_0_1px_2px_rgba(60,30,20,0.04)] transition-all focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-500/10";
const primaryButton =
  "relative w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-600 to-[#c2410c] text-white font-semibold tracking-wide shadow-[0_12px_30px_-10px_rgba(225,29,72,0.65)] hover:shadow-[0_16px_36px_-10px_rgba(225,29,72,0.8)] hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed";
const linkButton = "text-sm text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-50";

function Spinner() {
  return <span className="inline-block w-4 h-4 mr-2 -mb-0.5 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden />;
}

/**
 * Digit boxes for the OTP and PIN. A single real input sits invisibly over the boxes, so typing,
 * pasting, deleting and phone OTP autofill all behave like a normal field.
 */
function CodeBoxes({
  value,
  onChange,
  length,
  mask = false,
  autoFocus = false,
  autoComplete,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  length: number;
  mask?: boolean;
  autoFocus?: boolean;
  autoComplete: string;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <div className="relative">
      <div className={`flex justify-center ${length <= 4 ? "gap-3 sm:gap-4" : "gap-1.5 sm:gap-2.5"}`} aria-hidden>
        {Array.from({ length }).map((_, i) => {
          const ch = value[i];
          const active = focused && (i === value.length || (value.length === length && i === length - 1));
          return (
            <span
              key={i}
              className={`${length <= 4 ? "w-13 h-14 sm:w-14 sm:h-16" : "w-10 h-12 sm:w-12 sm:h-14"} rounded-xl flex items-center justify-center text-xl font-semibold text-neutral-900 transition-all duration-200 ${
                ch
                  ? "bg-white border border-rose-300 shadow-[0_6px_16px_-8px_rgba(225,29,72,0.45)]"
                  : "bg-white/70 border border-[#e8ddd3]"
              } ${active ? "border-rose-500 ring-4 ring-rose-500/15 scale-[1.04]" : ""}`}
            >
              {ch ? (
                mask ? (
                  <span className="lg-pop w-2.5 h-2.5 rounded-full bg-neutral-900" />
                ) : (
                  <span className="lg-pop">{ch}</span>
                )
              ) : active ? (
                <span className="lg-caret w-px h-6 bg-rose-500" />
              ) : null}
            </span>
          );
        })}
      </div>
      <input
        ref={ref}
        type={mask ? "password" : "text"}
        inputMode="numeric"
        autoComplete={autoComplete}
        aria-label={label}
        maxLength={length}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}

const STEP_ICONS: Record<Step, React.ReactNode> = {
  mobile: <WhatsAppIcon className="w-6 h-6" />,
  otp: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 018 0v3" />
      <circle cx="12" cy="15.5" r="1.2" fill="currentColor" />
    </svg>
  ),
  name: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
      <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.1 4.3 2.3h2c.7-1.2 2.2-2.3 4.3-2.3 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21z" />
    </svg>
  ),
  setPin: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l8-8M16 7l2 2M14 9l2 2" />
    </svg>
  ),
};

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
  const otpFormRef = useRef<HTMLFormElement>(null);
  const pinFormRef = useRef<HTMLFormElement>(null);

  // Sign in as soon as all 4 PIN digits are in.
  function changePin(v: string) {
    setPin(v);
    if (v.length === 4 && pin.length !== 4 && !loading) setTimeout(() => pinFormRef.current?.requestSubmit(), 150);
  }

  // Submit the code as soon as all 6 digits are in (typed, pasted or autofilled).
  function changeOtp(v: string) {
    setOtp(v);
    if (v.length === 6 && otp.length !== 6 && !loading) setTimeout(() => otpFormRef.current?.requestSubmit(), 150);
  }

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

  const titles: Record<Step, { eyebrow: string; title: string; subtitle: React.ReactNode }> = {
    mobile: {
      eyebrow: "Welcome",
      title: "Sign in to WedVibe",
      subtitle: "Enter your WhatsApp number to continue. New here? We'll create your account.",
    },
    pin: {
      eyebrow: "Welcome back",
      title: "Enter your PIN",
      subtitle: (
        <>
          Signing in as <span className="font-medium text-neutral-800 whitespace-nowrap">{mobile}</span>
        </>
      ),
    },
    otp: {
      eyebrow: "Verification",
      title: "Check your WhatsApp",
      subtitle: (
        <>
          We sent a 6-digit code to <span className="font-medium text-neutral-800 whitespace-nowrap">{mobile}</span>
        </>
      ),
    },
    name: { eyebrow: "You're verified", title: "What should we call you?", subtitle: "Your name appears on your invitations dashboard." },
    setPin: {
      eyebrow: "One last step",
      title: forgotPin ? "Set a new PIN" : "Create your PIN",
      subtitle: "Use this 4-digit PIN to sign in next time, with no code needed.",
    },
  };

  const errorBox = error && (
    <p key={error} role="alert" className="lg-shake flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-600">
      <svg viewBox="0 0 20 20" className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" aria-hidden>
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.5a.75.75 0 011.5 0v4a.75.75 0 01-1.5 0v-4zM10 14.75a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
      <span>{error}</span>
    </p>
  );

  return (
    <div className="relative flex-1 w-full bg-[#faf6f1] lg:grid lg:grid-cols-[1.05fr_1fr] min-h-[calc(100vh-4rem)]">
      <style>{`
        @keyframes lg-step-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes lg-pop { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes lg-caret { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes lg-shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }
        @keyframes lg-drift { from { transform: scale(1.04); } to { transform: scale(1.12) translateY(-1.5%); } }
        @keyframes lg-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .lg-step-in { animation: lg-step-in .5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .lg-pop { animation: lg-pop .22s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .lg-caret { animation: lg-caret 1s steps(1) infinite; }
        .lg-shake { animation: lg-shake .4s ease both; }
        .lg-drift { animation: lg-drift 22s ease-in-out infinite alternate; }
        .lg-float { animation: lg-float 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .lg-step-in, .lg-pop, .lg-caret, .lg-shake, .lg-drift, .lg-float { animation: none !important; } }
      `}</style>

      {/* ===== Photo panel (desktop: left half; phone: a band above the card) ===== */}
      <div className="relative h-52 sm:h-64 lg:h-auto overflow-hidden bg-[#140d0e]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/defaults/how-it-works.jpg" alt="" className="lg-drift absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140d0e] via-[#140d0e]/45 to-[#140d0e]/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(217,179,106,0.25),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#faf6f1] to-transparent lg:hidden" />

        <div className="relative h-full hidden lg:flex flex-col justify-between p-12 xl:p-16 text-white">
          <p className="text-xs uppercase tracking-[0.35em] text-[#e9cf93]">WedVibe</p>
          <div className="max-w-md">
            <span className="block w-12 h-px bg-gradient-to-r from-[#e9cf93] to-transparent mb-6" />
            <h2 className="font-serif text-4xl xl:text-5xl leading-[1.15] drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
              Every love story deserves a beautiful beginning.
            </h2>
            <ul className="mt-8 space-y-3 text-sm text-white/85">
              {["Elegant digital invitations in minutes", "One link to share with everyone on WhatsApp", "Live countdown, maps and event details"].map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-[10px] text-[#f3d68a]">✦</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/50">Trusted by couples across India</p>
        </div>
      </div>

      {/* ===== Form side ===== */}
      <div className="relative flex items-start lg:items-center justify-center px-4 sm:px-6 pb-16 lg:py-16 -mt-24 sm:-mt-28 lg:mt-0">
        <div className="absolute top-24 right-[8%] w-64 h-64 rounded-full bg-rose-200/40 blur-3xl pointer-events-none hidden lg:block" aria-hidden />
        <div className="absolute bottom-16 left-[6%] w-56 h-56 rounded-full bg-amber-200/40 blur-3xl pointer-events-none hidden lg:block" aria-hidden />

        <div className="relative w-full max-w-[420px]">
          <div className="relative rounded-[28px] bg-white/90 backdrop-blur-xl border border-white shadow-[0_30px_80px_-20px_rgba(80,40,30,0.3)] px-6 py-8 sm:px-9 sm:py-10">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#d9b36a] to-transparent" aria-hidden />

            <div key={step} className="lg-step-in">
              <div className="flex flex-col items-center text-center">
                <span
                  className={`lg-float w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    step === "mobile"
                      ? "bg-gradient-to-br from-[#25d366] to-[#128c7e] text-white shadow-emerald-500/30"
                      : "bg-gradient-to-br from-rose-500 to-[#c2410c] text-white shadow-rose-500/30"
                  }`}
                >
                  {STEP_ICONS[step]}
                </span>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b0843a]">{titles[step].eyebrow}</p>
                <h1 className="mt-2 font-serif text-[28px] leading-tight text-neutral-900">{titles[step].title}</h1>
                <p className="mt-2 text-sm text-neutral-500 leading-relaxed max-w-[300px]">{titles[step].subtitle}</p>
              </div>

              {step === "mobile" && (
                <form onSubmit={continueWithMobile} className="mt-8 space-y-5">
                  <div>
                    <label htmlFor="mobile" className={labelClass}>
                      WhatsApp number
                    </label>
                    <div className={fieldShell}>
                      <span className="flex items-center gap-1.5 pl-4 pr-3 py-3.5 border-r border-[#efe5dd] text-[#25d366]">
                        <WhatsAppIcon className="w-4 h-4" />
                      </span>
                      <input
                        id="mobile"
                        type="tel"
                        required
                        autoFocus
                        autoComplete="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="98765 43210"
                        className="flex-1 min-w-0 bg-transparent px-3.5 py-3.5 text-base tracking-wide text-neutral-900 placeholder:text-neutral-300 focus:outline-none"
                      />
                    </div>
                    <p className="mt-2 text-xs text-neutral-400">Indian numbers work without +91. For other countries, start with + and the country code.</p>
                  </div>
                  {errorBox}
                  <button type="submit" disabled={loading || !mobile.trim()} className={primaryButton}>
                    {loading && <Spinner />}
                    {loading ? "Please wait" : "Continue"}
                  </button>
                </form>
              )}

              {step === "pin" && (
                <form ref={pinFormRef} onSubmit={loginWithPin} className="mt-8 space-y-5">
                  <CodeBoxes value={pin} onChange={changePin} length={4} mask autoFocus autoComplete="current-password" label="PIN" />
                  {errorBox}
                  <button type="submit" disabled={loading || pin.length !== 4} className={primaryButton}>
                    {loading && <Spinner />}
                    {loading ? "Signing in" : "Sign in"}
                  </button>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPin(true);
                        sendOtp();
                      }}
                      disabled={loading}
                      className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
                    >
                      Forgot PIN?
                    </button>
                    <button type="button" onClick={() => goTo("mobile")} className={linkButton}>
                      Change number
                    </button>
                  </div>
                </form>
              )}

              {step === "otp" && (
                <form ref={otpFormRef} onSubmit={verifyOtp} className="mt-8 space-y-5">
                  {devOtp && (
                    // Only returned by the server in local test mode; never shown once a real WhatsApp provider is set.
                    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/80 px-4 py-2.5 text-sm flex items-center justify-between gap-3">
                      <p className="text-amber-800">
                        Test code: <span className="font-mono font-semibold tracking-widest">{devOtp}</span>
                      </p>
                      <button type="button" onClick={() => changeOtp(devOtp)} className="text-xs font-semibold text-amber-800 underline shrink-0">
                        Use code
                      </button>
                    </div>
                  )}
                  <CodeBoxes value={otp} onChange={changeOtp} length={6} autoFocus autoComplete="one-time-code" label="6-digit code" />
                  {errorBox}
                  <button type="submit" disabled={loading || otp.length !== 6} className={primaryButton}>
                    {loading && <Spinner />}
                    {loading ? "Verifying" : "Verify & Continue"}
                  </button>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      disabled={resendIn > 0 || loading}
                      onClick={() => sendOtp()}
                      className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:text-neutral-400"
                    >
                      {resendIn > 0 ? (
                        <>
                          Resend code in <span className="tabular-nums">0:{String(resendIn).padStart(2, "0")}</span>
                        </>
                      ) : (
                        "Resend code"
                      )}
                    </button>
                    <button type="button" onClick={() => goTo("mobile")} className={linkButton}>
                      Change number
                    </button>
                  </div>
                </form>
              )}

              {step === "name" && (
                <form onSubmit={saveName} className="mt-8 space-y-5">
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Your name
                    </label>
                    <div className={fieldShell}>
                      <input
                        id="name"
                        type="text"
                        required
                        autoFocus
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="flex-1 min-w-0 bg-transparent px-4 py-3.5 text-base text-neutral-900 placeholder:text-neutral-300 focus:outline-none"
                      />
                    </div>
                  </div>
                  {errorBox}
                  <button type="submit" disabled={loading || !name.trim()} className={primaryButton}>
                    {loading && <Spinner />}
                    {loading ? "Saving" : "Continue"}
                  </button>
                </form>
              )}

              {step === "setPin" && (
                <form onSubmit={savePin} className="mt-8 space-y-6">
                  <div>
                    <p className={`${labelClass} text-center`}>New PIN</p>
                    <CodeBoxes value={newPin} onChange={setNewPin} length={4} mask autoFocus autoComplete="new-password" label="New PIN" />
                  </div>
                  <div>
                    <p className={`${labelClass} text-center`}>Confirm PIN</p>
                    <CodeBoxes value={confirmPin} onChange={setConfirmPin} length={4} mask autoComplete="new-password" label="Confirm PIN" />
                    {confirmPin.length === 4 && newPin.length === 4 && (
                      <p className={`mt-2 text-center text-xs font-medium ${confirmPin === newPin ? "text-emerald-600" : "text-red-500"}`}>
                        {confirmPin === newPin ? "PINs match" : "PINs don't match"}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 text-center">Avoid easy PINs like 1111 or 1234.</p>
                  {errorBox}
                  <button type="submit" disabled={loading || newPin.length !== 4 || confirmPin.length !== 4} className={primaryButton}>
                    {loading && <Spinner />}
                    {loading ? "Saving" : "Save PIN & Continue"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-500">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
            </svg>
            Secured with WhatsApp verification
          </div>
          <p className="mt-2 text-center text-[11px] text-neutral-400">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline hover:text-neutral-600">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-neutral-600">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
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
