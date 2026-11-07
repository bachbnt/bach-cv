/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Candle, CareerMarker } from '@/skins/trade/blocks/build-candles';
import type { Interval } from '@/skins/trade/chart/chart-types';

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const HALF_DAY_MS = 12 * 60 * 60 * 1000;
const WEEKS_PER_YEAR = 52.1775;

/**
 * The candles of one interval, built from the weekly ones. `starts[k]` is the index of the first week of bar `k` (and the last entry
 * the number of weeks), `ends[k]` the start of its last week, so a bar knows which weeks it holds.
 */
export interface Bars {
  interval: Interval;
  candles: Candle[];
  starts: number[];
  ends: number[];
}

/**
 * The calendar day a bar starts on, for reading its month and year: the middle of the day, so the hour a week gains or loses at a
 * change of daylight saving time (the weeks are a fixed number of milliseconds apart) never moves it into the day before or after.
 */
export const calendarDay = (t: number): Date => new Date(t + HALF_DAY_MS);

/** The start of the calendar period (week, month, quarter or year) a time is in, in the visitor's time zone like the weeks themselves. */
export function periodStart(t: number, interval: Interval): number {
  if (interval === 'week') return t;
  const day = calendarDay(t);
  const year = day.getFullYear();
  const month = day.getMonth();
  if (interval === 'month') return new Date(year, month, 1).getTime();
  if (interval === 'quarter')
    return new Date(year, month - (month % 3), 1).getTime();
  return new Date(year, 0, 1).getTime();
}

/** The start of the period after the one `t` is in. */
export function periodEnd(t: number, interval: Interval): number {
  const start = periodStart(t, interval);
  if (interval === 'week') return start + WEEK_MS;
  const day = calendarDay(start);
  const year = day.getFullYear();
  const month = day.getMonth();
  if (interval === 'month') return new Date(year, month + 1, 1).getTime();
  if (interval === 'quarter') return new Date(year, month + 3, 1).getTime();
  return new Date(year + 1, 0, 1).getTime();
}

/**
 * Candles of a larger interval from the weekly ones: the first week of the period gives the time and the open, the last one the close,
 * the highest high and the lowest low and the sum of the volumes. The period the last week is in is included as it is so far (it is
 * the candle that is still moving). A week belongs to the period its first day is in. The weekly candles themselves are returned as
 * they are.
 */
export function aggregate(weekly: Candle[], interval: Interval): Bars {
  if (interval === 'week')
    return {
      interval,
      candles: weekly,
      starts: [...weekly.keys(), weekly.length],
      ends: weekly.map((k) => k.t),
    };
  const candles: Candle[] = [];
  const starts: number[] = [];
  const ends: number[] = [];
  let key = Number.NaN;
  weekly.forEach((k, index) => {
    const period = periodStart(k.t, interval);
    const open = candles.at(-1);
    if (period !== key || !open) {
      key = period;
      starts.push(index);
      ends.push(k.t);
      candles.push({ ...k });
      return;
    }
    open.h = Math.max(open.h, k.h);
    open.l = Math.min(open.l, k.l);
    open.c = k.c;
    open.v += k.v;
    ends[ends.length - 1] = k.t;
  });
  starts.push(weekly.length);
  return { interval, candles, starts, ends };
}

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

/** The bar that holds week number `week` (kept inside the bars). */
export function barOfWeek(bars: Bars, week: number): number {
  const last = bars.candles.length - 1;
  let low = 0;
  let high = last;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (bars.starts[mid] <= week) low = mid;
    else high = mid - 1;
  }
  return Math.max(0, low);
}

/** The first bar of the period `t` is in, or the first one after it; the last bar when the period has not started in the data. */
export function barAtTime(bars: Bars, t: number): number {
  const want = periodStart(t, bars.interval);
  const found = bars.candles.findIndex(
    (k) => periodStart(k.t, bars.interval) >= want,
  );
  return found < 0 ? bars.candles.length - 1 : found;
}

/**
 * The flags on the bars of an interval. A job sits on the bar of the period it started in (the month, the quarter or the year of its
 * first day, so a job that began on 1 January is on the new year, not on the week of December that held that day). Two jobs can share
 * a bar. Weekly flags are the ones the candles were built with.
 */
export function markersOn(markers: CareerMarker[], bars: Bars): CareerMarker[] {
  if (bars.interval === 'week') return markers;
  const byPeriod = new Map(
    bars.candles.map((k, index) => [periodStart(k.t, bars.interval), index]),
  );
  return markers.map((marker) => ({
    ...marker,
    index:
      byPeriod.get(periodStart(marker.start, bars.interval)) ??
      barOfWeek(bars, marker.index),
  }));
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
