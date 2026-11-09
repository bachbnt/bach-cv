/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The degree that started last, and the one being studied for at a time.

import { activeAt, type MonthSpanned } from '@/lib/derive/career-months';

/** The degree that started last, or `undefined` with no degree. */
export function latestDegree<T extends { startMonth: string }>(
  degrees: T[],
): T | undefined {
  return [...degrees].sort((a, b) =>
    b.startMonth.localeCompare(a.startMonth),
  )[0];
}

/** The degree being studied for at a time (milliseconds): started and not ended, the newest when two overlap; `null` otherwise. */
export const degreeAt = <T extends MonthSpanned>(
  degrees: T[],
  t: number,
): T | null => activeAt(degrees, t);
