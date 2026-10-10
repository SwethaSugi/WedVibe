import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { isOwnUploadUrl, storageMode, verifyBlobUpload } from "@/lib/providers/storage";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const tracks = await prisma.musicTrack.findMany({ orderBy: [{ mood: "asc" }, { title: "asc" }] });
  return NextResponse.json({ tracks });
}

const schema = z.object({
  url: z.string().min(1),
  title: z.string().trim().min(1).max(80),
  mood: z.string().trim().min(1).max(40),
  source: z.string().trim().min(1).max(80),
  sourceUrl: z.string().trim().url().max(500).optional().or(z.literal("").transform(() => undefined)),
  license: z.string().trim().max(120).optional(),
});

// Adds a song to the library. The file is uploaded first (/api/uploads/* with kind "admin-music");
// this records it with its details, after re-checking the file is one of ours and really audio.
export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in the title, mood and source (and a valid source link, if given)." }, { status: 400 });
  }
  const { url, license, ...details } = parsed.data;
  if (!isOwnUploadUrl(url, "admin-music")) return NextResponse.json({ error: "Upload the song file first." }, { status: 400 });
  if (storageMode() === "blob") {
    try {
      await verifyBlobUpload(url, "admin-music");
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid song file." }, { status: 400 });
    }
  }

  const track = await prisma.musicTrack.create({ data: { ...details, url, license: license || null } });
  return NextResponse.json({ track });
}
