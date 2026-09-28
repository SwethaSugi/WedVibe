import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { MAX_MUSIC_BYTES_CUSTOMER, saveUploadedAudio } from "@/lib/providers/storage";

// A couple's own song for their invitation. They must confirm they have the right to use it
// (see Terms); songs reported by a copyright holder are removed.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (formData.get("rightsConfirmed") !== "true") {
    return NextResponse.json({ error: "Please confirm you have the right to use this song." }, { status: 400 });
  }

  try {
    const url = await saveUploadedAudio(file, MAX_MUSIC_BYTES_CUSTOMER);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unable to upload the song." }, { status: 400 });
  }
}
