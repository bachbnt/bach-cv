/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { fill } from '@/lib/chat/fill';
import type { Lang } from '@/lib/content/schema';
import { formatDay, formatMonthAt } from '@/lib/format';
import { calendarDay, periodStart } from '@/lib/derive/career-series';
import type { Interval } from '@/skins/trade/chart/chart-types';

/**
 * How a bar is dated in the legend and on the crosshair: the day for a week, "Mar 2022" for a month, "Q1 2022" for a quarter and "2022"
 * for a year. `quarterDate` is the template of the language (`Q{quarter} {year}`).
 */
export function barLabeler(
  lang: Lang,
  quarterDate: string,
): (t: number, interval: Interval) => string {
  return (t, interval) => {
    if (interval === 'week') return formatDay(t, lang);
    const start = calendarDay(periodStart(t, interval));
    if (interval === 'month') return formatMonthAt(start.getTime(), lang);
    const year = start.getFullYear();
    if (interval === 'quarter')
      return fill(quarterDate, {
        quarter: Math.floor(start.getMonth() / 3) + 1,
        year,
      });
    return String(year);
  };
}
