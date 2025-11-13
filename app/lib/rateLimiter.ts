type RateLimitOptions = {
  windowMs?: number;
  maxRequests?: number;
};

export const DEFAULT_WINDOW_MS = 600_000; // 10 minutes
export const DEFAULT_MAX_REQUESTS = 2;

const requestLog = new Map<string, number[]>();

export function checkRateLimit(identifier: string, options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options.maxRequests ?? DEFAULT_MAX_REQUESTS;

  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = requestLog.get(identifier) ?? [];

  const recent = timestamps.filter((ts) => ts >= windowStart);
  recent.push(now);

  if (recent.length === 0) {
    requestLog.delete(identifier);
  } else {
    requestLog.set(identifier, recent);
  }

  const limited = recent.length > maxRequests;
  const retryAfterMs = limited ? Math.max(0, windowMs - (now - recent[0])) : 0;
  const remaining = limited ? 0 : Math.max(0, maxRequests - recent.length);

  return {
    limited,
    retryAfterMs,
    remaining,
    windowMs,
    maxRequests,
  };
}
