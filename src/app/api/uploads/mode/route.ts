import { NextResponse } from "next/server";
import { storageMode } from "@/lib/providers/storage";

// Tells the browser whether to upload straight to Vercel Blob or through /api/uploads/local.
export async function GET() {
  return NextResponse.json({ mode: storageMode() });
}
