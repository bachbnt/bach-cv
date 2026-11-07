/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { LANGS, type Lang } from '@/lib/content/schema';

/** Whole years from a `YYYY-MM` month to `now`, rounded to the nearest year (6 years and 8 months is 7), never below 0. */
export function yearsSince(startMonth: string, now: Date): number {
  const [year, month] = startMonth.split('-').map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return 0;
  const months = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  return Math.max(0, Math.round(months / 12));
}

/**
 * What the Details panel says about the career: the year of the first role ("Since") and the years from then to `now`. `null` with no
 * role, or when the first month is not a `YYYY-MM`. The roles the owner keeps hidden are not in the list, so they do not count.
 */
export function careerFacts(
  startMonths: string[],
  now: Date,
): { since: string; years: number } | null {
  const first = [...startMonths].sort()[0];
  if (first === undefined || !/^\d{4}-\d{2}$/.test(first)) return null;
  return { since: first.slice(0, 4), years: yearsSince(first, now) };
}

/** The names of the languages the site offers, in the order the site lists them (`LANGS`), each written in its own language. */
export function siteLanguageNames(
  offered: readonly Lang[],
  names: Record<Lang, string>,
): string[] {
  return LANGS.filter((lang) => offered.includes(lang)).map(
    (lang) => names[lang],
  );
}

/** Which tab a key moves to (a row of tabs wraps around), or `null` for a key that is not for the tabs. */
export function tabTarget(
  key: string,
  current: number,
  count: number,
): number | null {
  if (count < 1) return null;
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count;
    case 'ArrowLeft':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
