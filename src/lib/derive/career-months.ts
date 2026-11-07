/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The dates of a role as month numbers: span, months lasted, length in years and months.

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
