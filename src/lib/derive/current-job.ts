/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// Which role is current, first or latest, and whether an item is current.

import type { MonthSpanned } from '@/lib/derive/career-months';
import { newestFirst } from '@/lib/derive/recency';

/** A role or a degree is current while it has no end month. */
export const isCurrent = (item: Pick<MonthSpanned, 'endMonth'>): boolean =>
  !item.endMonth;

/** The role that is not over (the one that started last when several are), or `undefined` when every role has ended. */
export function currentJob<T extends MonthSpanned>(jobs: T[]): T | undefined {
  return [...jobs]
    .sort((a, b) => a.startMonth.localeCompare(b.startMonth))
    .findLast(isCurrent);
}

/** The role that started first (the first one given when several started in the same month), or `undefined` with no role. */
export function firstJob<T extends Pick<MonthSpanned, 'startMonth'>>(
  jobs: T[],
): T | undefined {
  return [...jobs].sort((a, b) => a.startMonth.localeCompare(b.startMonth))[0];
}

/** The role to present as "now": the current one, or the one that ended last when every role has ended. */
export function latestJob<T extends MonthSpanned>(jobs: T[]): T | undefined {
  return currentJob(jobs) ?? newestFirst(jobs)[0];
}
