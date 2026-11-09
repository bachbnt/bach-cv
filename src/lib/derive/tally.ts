/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// Tally marks for years: one stroke for each year, five to a group.

/** One group of tally marks: `strokes` upright strokes and, for a group of five, the stroke that crosses them. */
export interface TallyGroup {
  /** upright strokes: four in a full group (the fifth is the crossing one), fewer in the last group */
  strokes: number;
  /** a full group of five: four upright strokes and one across */
  crossed: boolean;
}

/** The years a skill (or a role) was in use, from its months: one for every year begun, so 1 month is 1 and 13 months are 2; none for 0. */
export const tallyYears = (months: number): number =>
  Number.isFinite(months) && months > 0 ? Math.ceil(months / 12) : 0;

/** The groups that write `years` as tally marks: 7 is a crossed group of five and a group of two. */
export function tallyGroups(years: number): TallyGroup[] {
  const groups: TallyGroup[] = [];
  for (let left = Math.max(0, Math.floor(years)); left > 0; left -= 5) {
    groups.push(
      left >= 5
        ? { strokes: 4, crossed: true }
        : { strokes: left, crossed: false },
    );
  }
  return groups;
}
