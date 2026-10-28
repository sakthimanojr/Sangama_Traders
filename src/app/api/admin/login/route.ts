import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/server/auth/password";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from "@/server/auth/session";
import { requiredEnv } from "@/server/env";
import { clearRateLimit, clientIp, hitRateLimit } from "@/server/security/rate-limit";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;

export async function POST(req: Request) {
  const key = `login:${clientIp(req.headers)}`;

  const limit = await hitRateLimit(key, MAX_ATTEMPTS, WINDOW_SECONDS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your password." }, { status: 422 });
  }

  const valid = await verifyPassword(parsed.data.password, requiredEnv("ADMIN_PASSWORD_HASH"));
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  await clearRateLimit(key);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(requiredEnv("SESSION_SECRET")), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
