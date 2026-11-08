/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  aggregate,
  periodStart,
  type Bars,
  type Candle,
  type Interval,
} from '@/lib/derive/career-series';

// The data of the intervals (the aggregate, the periods, the flags on the bars) is `lib/derive/career-series.ts`; this file is how the
// chart looks bars up and how many it shows.

const WEEKS_PER_YEAR = 52.1775;

const cache = new WeakMap<Candle[], Map<Interval, Bars>>();

/** `aggregate`, kept for each list of weekly candles and interval, so going back to an interval costs nothing. */
export function barsOf(weekly: Candle[], interval: Interval): Bars {
  let byInterval = cache.get(weekly);
  if (!byInterval) {
    byInterval = new Map();
    cache.set(weekly, byInterval);
  }
  let bars = byInterval.get(interval);
  if (!bars) {
    bars = aggregate(weekly, interval);
    byInterval.set(interval, bars);
  }
  return bars;
}

/** The first bar of the period `t` is in, or the first one after it; the last bar when the period has not started in the data. */
export function barAtTime(bars: Bars, t: number): number {
  const want = periodStart(t, bars.interval);
  const found = bars.candles.findIndex(
    (k) => periodStart(k.t, bars.interval) >= want,
  );
  return found < 0 ? bars.candles.length - 1 : found;
}

/** How many weeks one bar of each interval is worth. */
const WEEKS_PER_BAR: Record<Interval, number> = {
  week: 1,
  month: WEEKS_PER_YEAR / 12,
  quarter: WEEKS_PER_YEAR / 4,
  year: WEEKS_PER_YEAR,
};

/** The fewest bars a range shows, so that "1Y" on yearly candles still shows a few of them. */
const MIN_BARS: Record<Interval, number> = {
  week: 1,
  month: 6,
  quarter: 4,
  year: 3,
};

/** A range is a span of time (in weeks, `null` for everything): how many bars of an interval that is. */
export function rangeBars(
  weeks: number | null,
  interval: Interval,
): number | null {
  if (weeks === null) return null;
  return Math.max(
    MIN_BARS[interval],
    Math.round(weeks / WEEKS_PER_BAR[interval]),
  );
}
