/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The highlighted (ranked) items in rank order.

/** The highlighted items (`highlight` is a rank, 1 first), in rank order; the order of equal ranks is kept. */
export function highlighted<T extends { highlight: number | null }>(
  items: T[],
): T[] {
  return items
    .filter((item) => item.highlight !== null)
    .sort((a, b) => (a.highlight ?? 0) - (b.highlight ?? 0));
}
