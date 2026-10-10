import { NextRequest, NextResponse } from "next/server";
import { isUploadKind, saveNetlifyUploadPart, storageMode } from "@/lib/providers/storage";
import { uploadDenied } from "@/lib/upload-auth";

// Netlify uploads arrive in 4MB parts (see storage.ts). Form fields: part, kind, uploadId, index,
// last, rightsConfirmed, detailsToken. The response has the file's URL once the last part is in.
export async function POST(req: NextRequest) {
  if (storageMode() !== "netlify") return NextResponse.json({ error: "Netlify storage is not configured." }, { status: 400 });

  const form = await req.formData();
  const part = form.get("part");
  const kind = form.get("kind");
  const uploadId = form.get("uploadId");
  if (!(part instanceof File) || typeof uploadId !== "string") return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!isUploadKind(kind)) return NextResponse.json({ error: "Invalid upload type." }, { status: 400 });

  const denied = await uploadDenied(kind, form.get("rightsConfirmed") === "true", form.get("detailsToken") ?? undefined);
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  try {
    const url = await saveNetlifyUploadPart(part, kind, uploadId, Number(form.get("index")), form.get("last") === "true");
    return NextResponse.json(url ? { url } : { ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unable to upload the file." }, { status: 400 });
  }
}
