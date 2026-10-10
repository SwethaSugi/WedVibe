import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { UPLOAD_RULES, isUploadKind, storageMode } from "@/lib/providers/storage";
import { uploadDenied } from "@/lib/upload-auth";

// Issues short-lived tokens so the browser can upload straight to Vercel Blob (see storage.ts).
// The token only allows the right folder, file types and size for the requested kind.
export async function POST(req: NextRequest) {
  if (storageMode() !== "blob") return NextResponse.json({ error: "Blob storage is not configured." }, { status: 501 });

  const body = (await req.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload ?? "{}") as { kind?: unknown; rightsConfirmed?: unknown; detailsToken?: unknown };
        if (!isUploadKind(payload.kind)) throw new Error("Invalid upload type.");
        const denied = await uploadDenied(payload.kind, payload.rightsConfirmed === true, payload.detailsToken);
        if (denied) throw new Error(denied.error);

        const rule = UPLOAD_RULES[payload.kind];
        const ext = rule.folder === "music" ? "mp3|m4a" : "jpg|jpeg|png|webp";
        if (!new RegExp(`^${rule.folder}/[A-Za-z0-9_-]{1,60}\\.(${ext})$`).test(pathname)) throw new Error("Invalid file name.");

        return { allowedContentTypes: rule.contentTypes, maximumSizeInBytes: rule.maxBytes, addRandomSuffix: true };
      },
      // Uploads are checked by /api/uploads/verify right after they finish, so nothing to do here.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload not allowed." }, { status: 400 });
  }
}
