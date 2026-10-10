import { NextRequest, NextResponse } from "next/server";
import { storageMode, uploadsStore } from "@/lib/providers/storage";

// Serves uploaded photos and songs from Netlify Blobs at the same /uploads/... URLs that local
// development serves from public/uploads. Files never change once stored, so the CDN caches them.
// Supports Range requests, which Safari needs to play audio.
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const key = (await params).path.join("/");
  if (storageMode() !== "netlify" || !/^(music\/)?[A-Za-z0-9_-]+\.(jpg|png|webp|mp3|m4a)$/.test(key)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const stored = await uploadsStore().getWithMetadata(key, { type: "arrayBuffer" });
  if (!stored) return new NextResponse("Not found", { status: 404 });

  const body = new Uint8Array(stored.data);
  const headers: Record<string, string> = {
    "Content-Type": String(stored.metadata.contentType ?? "application/octet-stream"),
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };

  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") ?? "");
  if (range && (range[1] || range[2])) {
    const size = body.length;
    let start = range[1] ? Number(range[1]) : size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end) {
      return new NextResponse(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
    }
    return new NextResponse(body.slice(start, end + 1), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  return new NextResponse(body, {
    headers: { ...headers, "Content-Length": String(body.length), "Netlify-CDN-Cache-Control": "public, max-age=31536000, immutable, durable" },
  });
}
