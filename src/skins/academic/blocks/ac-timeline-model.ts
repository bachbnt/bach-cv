/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { monthSpan } from '@/lib/derive/career-months';
import type { TimelineKind, TimelineRow } from '@/lib/derive/career-timeline';

/** How a row is drawn: a full-time role, any other role, or a degree. */
type BarKind = 'full' | 'part' | 'edu';

export const barKind = (kind: TimelineKind): BarKind =>
  kind === 'degree' ? 'edu' : kind === 'full-time' ? 'full' : 'part';

/** Where a bar starts and how wide it is, as percentages of the years the figure covers (the layout of the figure, nothing else). */
export function placeBar(
  row: Pick<TimelineRow, 'startMonth' | 'endMonth'>,
  years: { from: number; to: number },
  now: Date,
): { left: number; width: number } {
  const total = (years.to - years.from + 1) * 12;
  const [first, last] = monthSpan(row, now);
  return {
    left: ((first - years.from * 12) / total) * 100,
    width: ((Math.max(last, first) - first + 1) / total) * 100,
  };
}

/** The years that get a label and a guide line (every second one, so the axis stays readable), with where each stands. */
export function axisYears(years: {
  from: number;
  to: number;
}): { year: number; left: number }[] {
  const span = years.to - years.from + 1;
  const marks: { year: number; left: number }[] = [];
  for (let year = years.from; year <= years.to; year += 1) {
    if (year % 2 === 0)
      marks.push({ year, left: ((year - years.from) / span) * 100 });
  }
  return marks;
}
