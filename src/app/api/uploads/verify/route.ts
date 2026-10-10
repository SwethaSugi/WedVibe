import { NextRequest, NextResponse } from "next/server";
import { isUploadKind, verifyBlobUpload } from "@/lib/providers/storage";
import { uploadDenied } from "@/lib/upload-auth";

// Called by the browser after a Blob upload finishes: checks the stored file really is an
// image/song within the size limit, and deletes it otherwise.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { url?: unknown; kind?: unknown; rightsConfirmed?: unknown; detailsToken?: unknown } | null;
  if (!body || typeof body.url !== "string" || !isUploadKind(body.kind)) {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const denied = await uploadDenied(body.kind, body.rightsConfirmed === true, body.detailsToken);
  if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

  try {
    return NextResponse.json({ url: await verifyBlobUpload(body.url, body.kind) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 400 });
  }
}
