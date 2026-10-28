import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/same-origin";
import { enquirySchema } from "@/lib/validation/enquiry";
import { toFieldErrors } from "@/lib/validation/errors";
import { createEnquiry } from "@/server/enquiries/service";
import { clientIp, hitRateLimit } from "@/server/security/rate-limit";

const MAX_REQUESTS = 8;
const WINDOW_SECONDS = 60 * 60;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden "website" field. Pretend it worked, store nothing.
  if (typeof json === "object" && json !== null && "website" in json) {
    const trap = (json as { website?: unknown }).website;
    if (typeof trap === "string" && trap.trim() !== "") {
      return NextResponse.json({ ok: true });
    }
  }

  const limit = await hitRateLimit(`enquiry:${clientIp(req.headers)}`, MAX_REQUESTS, WINDOW_SECONDS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many messages from your connection. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const parsed = enquirySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", errors: toFieldErrors(parsed.error.issues) },
      { status: 422 },
    );
  }

  await createEnquiry(parsed.data);
  return NextResponse.json({ ok: true }, { status: 201 });
}
