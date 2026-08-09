import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Simple file upload endpoint. Auth-gated (any signed-in user can upload).
// Stores public read-only URLs in Vercel Blob. Filenames are prefixed with
// the uploader's userId so we can enforce per-user cleanup later if needed.
export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "File uploads not configured: BLOB_READ_WRITE_TOKEN missing. Attach Vercel Blob under Storage → then redeploy.",
      },
      { status: 503 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
  }

  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `worklog/${s.userId}/${Date.now()}-${safe}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type || undefined,
  });

  return NextResponse.json({
    url: blob.url,
    pathname: blob.pathname,
    name: file.name,
    size: file.size,
    contentType: file.type,
  });
}
