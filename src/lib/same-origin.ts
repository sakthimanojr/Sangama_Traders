// Rejects browser requests that were started from another website.
// Requests without an Origin header (for example curl) are allowed here;
// admin routes still need a valid session cookie.
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
