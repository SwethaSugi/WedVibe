import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { MAX_MUSIC_BYTES_ADMIN, saveUploadedAudio } from "@/lib/providers/storage";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const tracks = await prisma.musicTrack.findMany({ orderBy: [{ mood: "asc" }, { title: "asc" }] });
  return NextResponse.json({ tracks });
}

const fieldsSchema = z.object({
  title: z.string().trim().min(1).max(80),
  mood: z.string().trim().min(1).max(40),
  source: z.string().trim().min(1).max(80),
  sourceUrl: z.string().trim().url().max(500).optional().or(z.literal("").transform(() => undefined)),
  license: z.string().trim().max(120).optional(),
});

// Adds a song to the library (multipart form: file + details).
export async function POST(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an MP3 or M4A file." }, { status: 400 });

  const parsed = fieldsSchema.safeParse({
    title: form.get("title") ?? "",
    mood: form.get("mood") ?? "",
    source: form.get("source") ?? "",
    sourceUrl: form.get("sourceUrl") ?? "",
    license: form.get("license") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in the title, mood and source (and a valid source link, if given)." }, { status: 400 });
  }

  let url: string;
  try {
    url = await saveUploadedAudio(file, MAX_MUSIC_BYTES_ADMIN);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unable to save the song." }, { status: 400 });
  }

  const track = await prisma.musicTrack.create({ data: { ...parsed.data, license: parsed.data.license || null, url } });
  return NextResponse.json({ track });
}
