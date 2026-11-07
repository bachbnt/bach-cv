/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// Items cut into runs of the same year.

export interface YearGroup<T> {
  /** `YYYY` */
  year: string;
  items: T[];
}

/**
 * The items in the order given, cut into runs of the same year. `dayOf` returns the `YYYY-MM-DD` (or `YYYY-MM`) date of an item. Items
 * of one year that are not next to each other stay in separate groups, so sort first.
 */
export function groupByYear<T>(
  items: T[],
  dayOf: (item: T) => string,
): YearGroup<T>[] {
  const groups: YearGroup<T>[] = [];
  for (const item of items) {
    const year = dayOf(item).slice(0, 4);
    const last = groups[groups.length - 1];
    if (last?.year === year) last.items.push(item);
    else groups.push({ year, items: [item] });
  }
  return groups;
}
