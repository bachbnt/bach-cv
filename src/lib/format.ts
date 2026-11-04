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
const PRESENT: Record<Lang, string> = { en: 'Present', vi: 'Nay' };

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
