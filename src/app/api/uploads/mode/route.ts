import { NextResponse } from "next/server";
import { storageMode } from "@/lib/providers/storage";

// Tells the browser how to upload: straight to Vercel Blob, in parts (Netlify), or through
// /api/uploads/local.
export async function GET() {
  return NextResponse.json({ mode: storageMode() });
}
