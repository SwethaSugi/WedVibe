import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";

// Sessions are signed with JWT_SECRET. The local-dev fallback is public (this repository is
// public), so in production signing/verifying refuses to run without a real secret. Checked at
// call time rather than import time so `next build` works without runtime secrets.
function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") throw new Error("JWT_SECRET must be set in production.");
  return "dev-secret-change-me";
}
const SESSION_COOKIE = "session_token";

export interface SessionPayload {
  userId: string;
  mobile: string;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: "30d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, jwtSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

// A valid token is not enough: the account must still exist and be ACTIVE, so disabling a user in
// the admin panel ends their session right away instead of when the 30-day token expires.
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = verifySession(token);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { status: true } });
  return user?.status === "ACTIVE" ? session : null;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

// Cryptographically secure 6-digit code (Math.random is predictable and unsafe for login codes).
export function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

export async function compareOtp(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

export const PIN_MAX_ATTEMPTS = 5;
export const PIN_LOCK_MINUTES = 15;

// A 4-digit PIN is only safe with lockouts (see pin-login) and without trivially
// guessable choices.
export function validatePin(pin: string): string | null {
  if (!/^\d{4}$/.test(pin)) return "PIN must be 4 digits.";
  if (/^(\d)\1+$/.test(pin)) return "Avoid repeating the same digit (like 1111).";
  const ascending = "01234567890123456789";
  const descending = "98765432109876543210";
  if (ascending.includes(pin) || descending.includes(pin)) return "Avoid sequences like 1234 or 4321.";
  return null;
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function comparePin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

const ADMIN_SESSION_COOKIE = "admin_session_token";

export interface AdminSessionPayload {
  adminId: string;
  username: string;
  role: string;
}

export function signAdminSession(payload: AdminSessionPayload): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: "12h" });
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, jwtSecret()) as AdminSessionPayload;
  } catch {
    return null;
  }
}

export async function setAdminSessionCookie(token: string) {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
}
