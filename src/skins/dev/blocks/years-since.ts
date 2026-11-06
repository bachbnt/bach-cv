/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** Whole years from a `YYYY-MM` month to `now`, rounded to the nearest year (6 years and 8 months is 7), never below 0. */
export function yearsSince(startMonth: string, now: Date): number {
  const [year, month] = startMonth.split('-').map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return 0;
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  return Math.max(0, Math.round(months / 12));
}
