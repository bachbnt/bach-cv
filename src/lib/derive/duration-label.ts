/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// Words for a length of time (used, role length, duration), from the slots of the copy.

import { lengthOfMonths } from '@/lib/derive/career-months';

export interface UsedUnits {
  /** `{n} y` */
  years: string;
  /** `{n} mo` */
  months: string;
}

const slot = (template: string, n: number | string) =>
  template.replace('{n}', String(n));

/** "8 mo" below a year, then years to one decimal without a trailing zero ("3.5 y", "4 y"). */
export function formatUsed(months: number, units: UsedUnits): string {
  if (months < 12) return slot(units.months, months);
  return slot(units.years, Math.round((months / 12) * 10) / 10);
}

/** A short length of a role: "3 y 2 mo", "3 y" or "5 mo". The words are slots (`{years}`, `{months}`) of the copy. */
export function lengthLabel(
  length: { years: number; months: number },
  words: { length: string; lengthYears: string; lengthMonths: string },
): string {
  const template =
    length.years > 0 && length.months > 0
      ? words.length
      : length.years > 0
        ? words.lengthYears
        : words.lengthMonths;
  return template
    .replace('{years}', String(length.years))
    .replace('{months}', String(length.months));
}

export interface DurationWords {
  yearOne: string;
  yearMany: string;
  monthOne: string;
  monthMany: string;
}

/** "3 years 9 months", "1 year", "11 months": the words come from the copy so both languages work. */
export function formatDuration(months: number, words: DurationWords): string {
  const parts = lengthOfMonths(months);
  const unit = (count: number, one: string, many: string) =>
    count === 1 ? one : many.replace('{count}', String(count));
  return [
    parts.years > 0 && unit(parts.years, words.yearOne, words.yearMany),
    parts.months > 0 && unit(parts.months, words.monthOne, words.monthMany),
  ]
    .filter(Boolean)
    .join(' ');
}
