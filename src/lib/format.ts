/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Lang } from '@/lib/content/schema';

const MONTHS: Record<Lang, string[]> = {
  en: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  vi: [
    'Thg 1',
    'Thg 2',
    'Thg 3',
    'Thg 4',
    'Thg 5',
    'Thg 6',
    'Thg 7',
    'Thg 8',
    'Thg 9',
    'Thg 10',
    'Thg 11',
    'Thg 12',
  ],
};
const MONTHS_LONG: Record<Lang, string[]> = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  vi: Array.from({ length: 12 }, (_, m) => `Tháng ${m + 1}`),
};
const WEEKDAYS: Record<Lang, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  vi: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
};
const PRESENT: Record<Lang, string> = { en: 'Present', vi: 'Nay' };

/** The short name of a month (0 is January): `May`, `Thg 5`. */
export const shortMonthName = (month: number, lang: Lang = 'en'): string =>
  MONTHS[lang][month];

/** The full name of a month (0 is January): `May`, `Tháng 5`. */
export const longMonthName = (month: number, lang: Lang = 'en'): string =>
  MONTHS_LONG[lang][month];

const parse = (ym: string, lang: Lang) => ({
  year: Number(ym.slice(0, 4)),
  month: MONTHS[lang][Number(ym.slice(5, 7)) - 1],
});

/** 'May 2022' / 'Thg 5 2022' from '2022-05'. */
export const formatMonth = (ym: string, lang: Lang = 'en'): string => {
  const { year, month } = parse(ym, lang);
  return `${month} ${year}`;
};

/**
 * 'May 2022 – Jan 2026', 'May – Dec 2023' (same year), 'Jan 2026 – Present' (no end).
 * The dash is an en dash, as in the design mockup.
 */
export const formatPeriod = (
  start: string,
  end: string | null,
  lang: Lang = 'en',
): string => {
  const from = parse(start, lang);
  if (!end) return `${from.month} ${from.year} – ${PRESENT[lang]}`;
  const to = parse(end, lang);
  return from.year === to.year
    ? `${from.month} – ${to.month} ${to.year}`
    : `${from.month} ${from.year} – ${to.month} ${to.year}`;
};

/** 'May 2022' / 'Thg 5 2022' from a time in milliseconds (the chart's axis and legend): the same words as `formatMonth`. */
export const formatMonthAt = (t: number, lang: Lang = 'en'): string => {
  const date = new Date(t);
  return `${shortMonthName(date.getMonth(), lang)} ${date.getFullYear()}`;
};

/** 'Tue 17 May 22' / 'T3 17 Thg 5 22': the day of a weekly bar. */
export const formatDay = (t: number, lang: Lang = 'en'): string => {
  const date = new Date(t);
  const year = String(date.getFullYear()).slice(-2);
  return `${WEEKDAYS[lang][date.getDay()]} ${date.getDate()} ${shortMonthName(date.getMonth(), lang)} ${year}`;
};
