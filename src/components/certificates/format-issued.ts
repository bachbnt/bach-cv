/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Lang } from '@/lib/content/schema';

const MONTHS = [
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
];

/**
 * '2026-05-01' -> 'May 01, 2026' (en, as in the design mockup) or '01/05/2026' (vi).
 * Anything that is not a YYYY-MM-DD day is returned as is.
 */
export const formatIssued = (day: string, lang: Lang = 'en'): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  const month = m ? MONTHS[Number(m[2]) - 1] : undefined;
  if (!m || !month) return day;
  return lang === 'vi'
    ? `${m[3]}/${m[2]}/${m[1]}`
    : `${month} ${m[3]}, ${m[1]}`;
};
