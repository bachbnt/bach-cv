/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The dates of a role as month numbers and times: span, months lasted, length in years and months, which one was active at a time.

/** The dates of a role or a degree, as the schema stores them. */
export interface MonthSpanned {
  startMonth: string;
  endMonth: string | null;
}

/** A `YYYY-MM` month as a number of months since year 0, so two months can be subtracted. */
export const monthIndex = (month: string): number =>
  Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;

/** The month index of `now`. */
export const nowMonthIndex = (now: Date): number =>
  now.getFullYear() * 12 + now.getMonth();

/**
 * The first and the last month of a role: both months count, and the current role (no end) ends this month. The one reading of the
 * dates of a role: tenure, months used, years in a skill and the sparkline all start from it.
 */
export const monthSpan = (
  item: MonthSpanned,
  now: Date,
): [first: number, last: number] => [
  monthIndex(item.startMonth),
  item.endMonth ? monthIndex(item.endMonth) : nowMonthIndex(now),
];

/** The months a role lasted, both the first and the last counted; never below one, even for an end before the start. */
export const spanMonths = (item: MonthSpanned, now: Date): number => {
  const [first, last] = monthSpan(item, now);
  return Math.max(last, first) - first + 1;
};

/** A number of months as whole years and the months left over: 45 is 3 years and 9 months. */
export const lengthOfMonths = (
  months: number,
): { years: number; months: number } => ({
  years: Math.floor(months / 12),
  months: months % 12,
});

/** How long a role lasted, in whole years and the months left over (both months of the span count). */
export const jobLength = (
  job: MonthSpanned,
  now: Date,
): { years: number; months: number } => lengthOfMonths(spanMonths(job, now));

/** The local time of the first day of the month with this index (`monthIndex`), in milliseconds; `NaN` for a month that is not one. */
const monthTime = (index: number): number =>
  Number.isFinite(index)
    ? new Date(Math.floor(index / 12), index % 12, 1).getTime()
    : Number.NaN;

const isMonth = (month: string): boolean =>
  /^\d{4}-(0[1-9]|1[0-2])/.test(month);

/** The first day of a `YYYY-MM` month, in milliseconds, or `NaN` when it is not a month. */
export const monthStart = (month: string): number =>
  isMonth(month) ? monthTime(monthIndex(month)) : Number.NaN;

/** The first day after a `YYYY-MM` month: the end month of a role is a whole month, so the role lasts until the next one begins. */
export const endExclusive = (month: string): number =>
  isMonth(month) ? monthTime(monthIndex(month) + 1) : Number.NaN;

/**
 * The item (role or degree) that had started and not ended at a time, the one that started last when two overlap, or `null`.
 * An end month counts whole; an item with no end goes on; a month that is not one never matches.
 */
export function activeAt<T extends MonthSpanned>(
  items: T[],
  t: number,
): T | null {
  let found: T | null = null;
  let foundStart = Number.NEGATIVE_INFINITY;
  for (const item of items) {
    const start = monthStart(item.startMonth);
    const end = item.endMonth
      ? endExclusive(item.endMonth)
      : Number.POSITIVE_INFINITY;
    if (t >= start && t < end && start > foundStart) {
      found = item;
      foundStart = start;
    }
  }
  return found;
}

/** The months of a role as a tenure: where it starts and ends (`monthIndex`) and how many months both ends counted. */
export interface Tenure {
  /** first month of the role */
  start: number;
  /** last month of the role (the current one ends this month; never before the start) */
  end: number;
  /** months from the first to the last, both counted */
  months: number;
}

export const tenureOf = (item: MonthSpanned, now: Date): Tenure => {
  const [start, last] = monthSpan(item, now);
  return { start, end: Math.max(start, last), months: spanMonths(item, now) };
};
