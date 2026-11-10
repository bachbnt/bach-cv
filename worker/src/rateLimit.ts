/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The part of a Workers KV namespace that is used here (so tests can pass a plain object). */
export interface KvLike {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
}

/** The reasons a request is refused by the limiter. Anything else that goes wrong in it (a KV error, a spent write quota) is not one of these. */
export type RateLimitCode =
  | 'rate_limit_unavailable'
  | 'rate_limit_minute'
  | 'rate_limit_hour'
  | 'rate_limit_day';

/** A refusal by the limiter, as opposed to a failure of the limiter: the caller may tell the visitor its `code`. */
export class RateLimitError extends Error {
  constructor(public code: RateLimitCode) {
    super(code);
  }
}

export interface RateLimitEnv {
  CHAT_RATE_LIMIT?: KvLike;
  RATE_LIMIT_PER_DAY?: string;
  RATE_LIMIT_PER_MINUTE?: string;
  /** "true" refuses chat requests while no KV namespace is bound, instead of letting everything through */
  REQUIRE_RATE_LIMIT?: string;
}

const parseLimit = (raw: string | undefined, fallback: number): number => {
  const value = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export const enforceRateLimit = async (
  env: RateLimitEnv,
  ip: string,
): Promise<void> => {
  if (!env.CHAT_RATE_LIMIT) {
    if (env.REQUIRE_RATE_LIMIT === 'true')
      throw new RateLimitError('rate_limit_unavailable');
    return;
  }

  const perMinute = parseLimit(env.RATE_LIMIT_PER_MINUTE, 10);
  const perDay = parseLimit(env.RATE_LIMIT_PER_DAY, 200);
  const now = Date.now();
  const minuteBucket = Math.floor(now / 60_000);
  const dayBucket = Math.floor(now / 86_400_000);

  const minuteKey = `m:${ip}:${minuteBucket}`;
  const dayKey = `d:${ip}:${dayBucket}`;

  const [minuteRaw, dayRaw] = await Promise.all([
    env.CHAT_RATE_LIMIT.get(minuteKey),
    env.CHAT_RATE_LIMIT.get(dayKey),
  ]);

  const minuteCount = Number.parseInt(minuteRaw ?? '0', 10);
  const dayCount = Number.parseInt(dayRaw ?? '0', 10);

  if (minuteCount >= perMinute) {
    throw new RateLimitError('rate_limit_minute');
  }
  if (dayCount >= perDay) {
    throw new RateLimitError('rate_limit_day');
  }

  await Promise.all([
    env.CHAT_RATE_LIMIT.put(minuteKey, String(minuteCount + 1), {
      expirationTtl: 120,
    }),
    env.CHAT_RATE_LIMIT.put(dayKey, String(dayCount + 1), {
      expirationTtl: 90_000,
    }),
  ]);
};

/**
 * Limits for the email notification: a few per visitor per hour, and a cap for the whole site per day
 * (the free email plan has a daily quota that one visitor must not be able to use up).
 */
export const enforceNotifyLimit = async (
  env: RateLimitEnv & { NOTIFY_PER_HOUR?: string; NOTIFY_PER_DAY?: string },
  ip: string,
): Promise<void> => {
  const kv = env.CHAT_RATE_LIMIT;
  if (!kv) throw new RateLimitError('rate_limit_unavailable');
  const perHour = parseLimit(env.NOTIFY_PER_HOUR, 5);
  const perDay = parseLimit(env.NOTIFY_PER_DAY, 40);
  const now = Date.now();
  const hourKey = `n:h:${ip}:${Math.floor(now / 3_600_000)}`;
  const dayKey = `n:d:${Math.floor(now / 86_400_000)}`;
  const [hourRaw, dayRaw] = await Promise.all([
    kv.get(hourKey),
    kv.get(dayKey),
  ]);
  const hour = Number.parseInt(hourRaw ?? '0', 10);
  const day = Number.parseInt(dayRaw ?? '0', 10);
  if (hour >= perHour) throw new RateLimitError('rate_limit_hour');
  if (day >= perDay) throw new RateLimitError('rate_limit_day');
  await Promise.all([
    kv.put(hourKey, String(hour + 1), { expirationTtl: 7_200 }),
    kv.put(dayKey, String(day + 1), { expirationTtl: 90_000 }),
  ]);
};
