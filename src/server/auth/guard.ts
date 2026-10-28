import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET);
}

// For admin pages. Middleware already blocks visitors; this is a second check.
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdminSession())) redirect("/admin/login");
}

// For write APIs. Returns a 401 response to send back, or null when the caller is the admin.
export async function requireAdminApi(): Promise<NextResponse | null> {
  if (await isAdminSession()) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
