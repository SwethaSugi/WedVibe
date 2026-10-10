import { NextRequest, NextResponse } from "next/server";
import { isUploadKind, saveLocalUpload, storageMode } from "@/lib/providers/storage";
import { uploadDenied } from "@/lib/upload-auth";

// Local development uploads (no Blob store configured): the file comes through the server and is
// saved under public/uploads. Form fields: file, kind, rightsConfirmed.
export async function POST(req: NextRequest) {
  if (storageMode() !== "local") return NextResponse.json({ error: "Use Blob uploads." }, { status: 400 });

  const form = await req.formData();
  const file = form.get("file");
  const kind = form.get("kind");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!isUploadKind(kind)) return NextResponse.json({ error: "Invalid upload type." }, { status: 400 });

  const denied = await uploadDenied(kind, form.get("rightsConfirmed") === "true", form.get("detailsToken") ?? undefined);
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  try {
    return NextResponse.json({ url: await saveLocalUpload(file, kind) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unable to upload the file." }, { status: 400 });
  }
}
