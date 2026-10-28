import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/server/auth/guard";
import { createSignedUpload } from "@/server/cloudinary/sign";

const bodySchema = z.object({ kind: z.enum(["image", "document"]) });

// Returns a short-lived signature so the browser can upload a file straight to Cloudinary.
export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload type." }, { status: 422 });
  }

  return NextResponse.json(createSignedUpload(parsed.data.kind), { headers: { "Cache-Control": "no-store" } });
}
