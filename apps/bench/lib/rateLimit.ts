/**
 * A minimal in-memory, fixed-window rate limiter. It has no external
 * dependency (no Redis/KV) and needs no configuration, so it's a real
 * default rather than the "optional, documented only" state this was in
 * before — see docs/BYOK.md. Its one real limitation: state is per-process,
 * so it does nothing useful across multiple server instances (serverless,
 * multi-region). If you deploy the hosted demo behind more than one
 * instance, swap this for Vercel KV/Upstash — same call signature, just a
 * shared store instead of the Map below.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}

/** Best-effort client identifier — trusts the first `x-forwarded-for` hop, which is what most hosting platforms (Vercel included) set. */
export function clientKeyFromRequest(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return "unknown";
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return Response.json(
    { error: "Too many requests. Slow down and try again shortly." },
    {
      status: 429,
      headers: result.retryAfterSeconds ? { "Retry-After": String(result.retryAfterSeconds) } : undefined,
    },
  );
}
