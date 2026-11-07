/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { monthIndex, nowMonthIndex } from '@/lib/derive/career-months';

/** How many months the career has lasted: from the earliest start month to this month, both counted; 0 with no start. */
export function careerMonthCount(startMonths: string[], now: Date): number {
  const first = [...startMonths].sort()[0];
  if (first === undefined) return 0;
  return Math.max(0, nowMonthIndex(now) - monthIndex(first) + 1);
}

/** The share (0 to 1) of the career that `months` make; 0 when the career has no length yet. */
export const careerShare = (months: number, careerMonths: number): number =>
  careerMonths <= 0 ? 0 : Math.min(1, Math.max(0, months / careerMonths));
