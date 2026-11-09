/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Candle } from '@/lib/derive/career-series';
import type { Interval } from '@/skins/trade/chart/chart-types';
import { periodEnd, periodStart } from '@/lib/derive/career-series';

/**
 * Time and the bar index of an interval, one into the other. Bar `k` covers the time from `candles[k].t` to the start of the next
 * bar, and its middle (index `k`) is the middle of that time; the time runs in a straight line inside a bar, and before the first
 * bar and after the last one it goes on at the length of a period. A drawing is kept in time, so it stays at the same date when the
 * interval changes; the chart puts it on screen through the index of the interval it shows.
 */
export interface TimeAxis {
  /** the (fractional) bar index of a time */
  index: (t: number) => number;
  /** the time of a (fractional) bar index */
  time: (index: number) => number;
}

export function makeAxis(candles: Candle[], interval: Interval): TimeAxis {
  if (candles.length === 0) return { index: () => 0, time: (index) => index };
  const edge = edges(candles, interval);
  return { index: (t) => edge.index(t) - 0.5, time: (i) => edge.time(i + 0.5) };
}

/** The same, with each bar standing at its first moment (index `k` is `candles[k].t`). */
function edges(candles: Candle[], interval: Interval): TimeAxis {
  const n = candles.length;
  const first = candles[0].t;
  const last = candles[n - 1].t;
  const unit = (t: number) => periodEnd(t, interval) - periodStart(t, interval);
  const before = unit(first);
  const after = unit(last);
  return {
    index: (t) => {
      if (t <= first) return (t - first) / before;
      if (t >= last) return n - 1 + (t - last) / after;
      let low = 0;
      let high = n - 1;
      while (high - low > 1) {
        const mid = (low + high) >> 1;
        if (candles[mid].t <= t) low = mid;
        else high = mid;
      }
      return low + (t - candles[low].t) / (candles[low + 1].t - candles[low].t);
    },
    time: (index) => {
      if (index <= 0) return first + index * before;
      if (index >= n - 1) return last + (index - (n - 1)) * after;
      const k = Math.floor(index);
      return candles[k].t + (index - k) * (candles[k + 1].t - candles[k].t);
    },
  };
}
