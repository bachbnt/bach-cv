/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { fill } from '@/lib/chat/fill';
import type { Interval } from '@/skins/trade/chart/chart-types';
import { calendarDay, periodStart } from '@/skins/trade/chart/intervals';

/**
 * How a bar is dated in the legend and on the crosshair: the day for a week, "Mar 2022" for a month, "Q1 2022" for a quarter and "2022"
 * for a year. `quarterDate` is the template of the language (`Q{quarter} {year}`).
 */
export function barLabeler(
  lang: string,
  quarterDate: string,
): (t: number, interval: Interval) => string {
  const day = new Intl.DateTimeFormat(lang, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });
  const month = new Intl.DateTimeFormat(lang, {
    month: 'short',
    year: 'numeric',
  });
  return (t, interval) => {
    if (interval === 'week') return day.format(t);
    const start = calendarDay(periodStart(t, interval));
    if (interval === 'month') return month.format(start);
    const year = start.getFullYear();
    if (interval === 'quarter')
      return fill(quarterDate, {
        quarter: Math.floor(start.getMonth() / 3) + 1,
        year,
      });
    return String(year);
  };
}
