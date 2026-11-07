/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The degree that started last.

/** The degree that started last, or `undefined` with no degree. */
export function latestDegree<T extends { startMonth: string }>(
  degrees: T[],
): T | undefined {
  return [...degrees].sort((a, b) =>
    b.startMonth.localeCompare(a.startMonth),
  )[0];
}
