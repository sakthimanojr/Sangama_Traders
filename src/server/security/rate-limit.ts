import "server-only";
import { sql } from "drizzle-orm";
import { getDb } from "../db";

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

// Fixed-window counter stored in Postgres, so it holds across all serverless instances.
export async function hitRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const db = getDb();
  const result = await db.execute<{ count: number; retry_after: number }>(sql`
    insert into rate_limits (key, window_start, count)
    values (${key}, now(), 1)
    on conflict (key) do update set
      count = case
        when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds}::float8) then 1
        else rate_limits.count + 1
      end,
      window_start = case
        when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds}::float8) then now()
        else rate_limits.window_start
      end
    returning
      count,
      greatest(1, ceil(extract(epoch from (window_start + make_interval(secs => ${windowSeconds}::float8) - now()))))::int as retry_after
  `);

  const row = result.rows[0];
  const count = Number(row?.count ?? 1);
  const retryAfterSeconds = Number(row?.retry_after ?? windowSeconds);

  if (Math.random() < 0.02) {
    // Occasional cleanup of old rows.
    await db.execute(sql`delete from rate_limits where window_start < now() - interval '1 day'`);
  }

  return { allowed: count <= limit, retryAfterSeconds };
}

export async function clearRateLimit(key: string): Promise<void> {
  await getDb().execute(sql`delete from rate_limits where key = ${key}`);
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || headers.get("x-real-ip") || "unknown";
}
