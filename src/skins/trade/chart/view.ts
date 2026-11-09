/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Candle } from '@/lib/derive/career-series';
import type { Interval } from '@/skins/trade/chart/chart-types';
import { calendarDay, periodStart } from '@/lib/derive/career-series';
import { rangeBars } from '@/skins/trade/chart/intervals';
import type { TimeAxis } from '@/skins/trade/chart/time-axis';
import type { RangeKey } from '@/skins/trade/config';
import { RANGES } from '@/skins/trade/config';

/**
 * The window of the chart in the units of the candles: `from` is the (fractional) index of the bar at the left edge and `span` the
 * number of bars across the plot. Zoom changes the span, pan changes `from`; every pixel position comes from these two numbers.
 */
export interface View {
  from: number;
  span: number;
}

/** What zoom and pan may do for one interval: how many bars there are, the fewest bars across the plot and the empty slots after the last bar. */
export interface Limits {
  count: number;
  minSpan: number;
  pad: number;
}

/** The fewest bars across the plot and the empty slots after the last bar, for each interval: a yearly chart has a handful of wide bars. */
const SPANS: Record<Interval, { minSpan: number; pad: number }> = {
  week: { minSpan: 8, pad: 4 },
  month: { minSpan: 8, pad: 3 },
  quarter: { minSpan: 6, pad: 2 },
  year: { minSpan: 5, pad: 1.5 },
};

export const limitsOf = (count: number, interval: Interval): Limits => ({
  count,
  ...SPANS[interval],
});

/** The bars that must stay on screen when the chart is panned away from the data. */
const MIN_VISIBLE = 3;

export function clampView(view: View, limits: Limits): View {
  const { count, minSpan, pad } = limits;
  const max = Math.max(minSpan, count + pad);
  const span = Math.min(max, Math.max(minSpan, view.span));
  const visible = Math.min(MIN_VISIBLE, count);
  const from = Math.min(count - visible, Math.max(visible - span, view.from));
  return { from, span };
}

/**
 * The view of a range button: the last `bars` bars (or all of them) and the empty slots after them, never fewer bars across the plot
 * than the interval allows.
 */
export function rangeView(limits: Limits, bars: number | null): View {
  const { count, minSpan, pad } = limits;
  const shown = bars === null ? count : Math.min(count, bars);
  const span = Math.max(minSpan, shown + pad);
  return { from: count + pad - span, span };
}

/**
 * The range button whose view this is (a little off is still the same one), or `null` after a zoom or a pan. When several ranges are
 * the same view (a yearly chart shows the same few bars for 3M and 1Y), the one asked for last (`prefer`) wins, else the longest.
 */
export function activeRange(
  view: View,
  limits: Limits,
  interval: Interval,
  prefer: RangeKey | null = null,
): RangeKey | null {
  const same = RANGES.filter(({ weeks }) => {
    const want = rangeView(limits, rangeBars(weeks, interval));
    return (
      Math.abs(view.from - want.from) < 0.5 &&
      Math.abs(view.span - want.span) < 0.5
    );
  }).map((r) => r.key);
  if (prefer && same.includes(prefer)) return prefer;
  return same.at(-1) ?? null;
}

/** The most and the fewest bars that may be across the plot. */
const spanWithin = ({ count, minSpan, pad }: Limits, span: number): number =>
  Math.min(Math.max(minSpan, count + pad), Math.max(minSpan, span));

/**
 * Zooms by `factor` (above 1 shows more bars) keeping the bar at `anchor` (0 to 1 across the plot) where it is. The span is limited
 * FIRST and the left edge worked out from the span that is left: at the most or the fewest bars a zoom changes nothing, it never
 * slides the chart (zooming out at the limit must not pull the chart back to its first bar).
 */
export function zoomView(
  view: View,
  factor: number,
  anchor: number,
  limits: Limits,
): View {
  const span = spanWithin(limits, view.span * factor);
  const pinned = view.from + view.span * anchor;
  return clampView({ from: pinned - span * anchor, span }, limits);
}

export function panView(view: View, bars: number, limits: Limits): View {
  return clampView({ from: view.from + bars, span: view.span }, limits);
}

/** The view that has bar `index` in its middle, at the same zoom. */
export function centerView(view: View, index: number, limits: Limits): View {
  return clampView(
    { from: index + 0.5 - view.span / 2, span: view.span },
    limits,
  );
}

/**
 * The window of one interval for the time that another one shows: the same stretch of time, so the centre stays on the same date.
 * A stretch too short or too long for the new interval is made as long as it may be around the same centre, and a window that would
 * run past the empty slots after the last bar is slid back to them.
 */
export function retargetView(
  view: View,
  from: TimeAxis,
  to: TimeAxis,
  limits: Limits,
): View {
  const left = to.index(from.time(view.from - 0.5)) + 0.5;
  const right = to.index(from.time(view.from + view.span - 0.5)) + 0.5;
  const max = Math.max(limits.minSpan, limits.count + limits.pad);
  const span = Math.min(max, Math.max(limits.minSpan, right - left));
  const centre = (left + right) / 2;
  return clampView(
    {
      from: Math.min(centre - span / 2, limits.count + limits.pad - span),
      span,
    },
    limits,
  );
}

export function lerpView(a: View, b: View, t: number): View {
  return {
    from: a.from + (b.from - a.from) * t,
    span: a.span + (b.span - a.span) * t,
  };
}

export const easeOut = (t: number): number => 1 - (1 - t) ** 3;

/** The view moved just enough that the bar `index` is on screen with a little room on its right (replay follows the playhead). */
export function followView(view: View, index: number, limits: Limits): View {
  const right = view.from + view.span - limits.pad;
  if (index + 1 <= right) return view;
  return clampView(
    { from: index + 1 - (view.span - limits.pad), span: view.span },
    limits,
  );
}

/** Where bars sit across a plot `plotWidth` pixels wide. */
export interface TimeScale {
  slot: number;
  /** the width of the body of a candle */
  body: number;
  x: (index: number) => number;
  /** the bar under a pixel (not clamped) */
  barAt: (x: number) => number;
  /** the fractional index under a pixel */
  indexAt: (x: number) => number;
}

export function makeTimeScale(view: View, plotWidth: number): TimeScale {
  const slot = plotWidth / view.span;
  return {
    slot,
    body: Math.max(1, slot * 0.7),
    x: (index) => (index - view.from + 0.5) * slot,
    barAt: (x) => Math.floor(x / slot + view.from),
    indexAt: (x) => x / slot + view.from - 0.5,
  };
}

/** The bars that are on screen: from the first to one past the last, kept inside the data. */
export function visibleBars(
  view: View,
  count: number,
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(view.from));
  const end = Math.min(count, Math.ceil(view.from + view.span));
  return { start, end: Math.max(start, end) };
}

/** A price scale: `lo` sits at `bottom` and `hi` at `top` (pixels), in a straight line or in logarithms. */
export interface PriceScale {
  lo: number;
  hi: number;
  top: number;
  bottom: number;
  log: boolean;
  y: (price: number) => number;
  priceAt: (y: number) => number;
}

const floorPrice = (price: number) => Math.max(price, 1e-6);

export function makePriceScale(
  lo: number,
  hi: number,
  top: number,
  bottom: number,
  log: boolean,
): PriceScale {
  const a = log ? Math.log(floorPrice(lo)) : lo;
  const b = log ? Math.log(floorPrice(hi)) : hi;
  const range = b - a || 1;
  const height = bottom - top;
  const to = (price: number) => (log ? Math.log(floorPrice(price)) : price);
  return {
    lo,
    hi,
    top,
    bottom,
    log,
    y: (price) => bottom - ((to(price) - a) / range) * height,
    priceAt: (y) => {
      const v = a + ((bottom - y) / height) * range;
      return log ? Math.exp(v) : v;
    },
  };
}

/** Round prices for the grid lines: steps of 1, 2, 2.5 or 5 times a power of ten, about `target` of them between `lo` and `hi`. */
export function niceTicks(lo: number, hi: number, target = 6): number[] {
  const span = hi - lo;
  if (!(span > 0)) return [lo];
  const rough = span / target;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= rough) ??
    10 * power;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step)
    ticks.push(Math.round(v * 1000) / 1000);
  return ticks;
}

export interface AxisLabel {
  index: number;
  month: number;
  year: number;
  /** January: the label is the year */
  major: boolean;
}

const MONTH_MS = 30.44 * 24 * 60 * 60 * 1000;

/**
 * The labels of the time axis for the bars `start` to `end` of `candles`, kept at least `minGap` pixels apart: the months that start a
 * quarter (or a year, for a long range) for weeks and months, the quarters, and every year for yearly bars. A bar is dated by the
 * period it is in, so the first bar of a year is the year even when the career began in March.
 */
export function axisLabels(
  candles: Candle[],
  start: number,
  end: number,
  slot: number,
  interval: Interval = 'week',
  minGap = 44,
): AxisLabel[] {
  if (end - start < 2) return [];
  const span = (candles[end - 1].t - candles[start].t) / MONTH_MS;
  const every = interval === 'year' || span > 36 ? 12 : span > 14 ? 3 : 1;
  const labels: AxisLabel[] = [];
  let previous = -1;
  let last = Number.NEGATIVE_INFINITY;
  for (let index = start; index < end; index++) {
    const date = calendarDay(periodStart(candles[index].t, interval));
    const month = date.getMonth();
    // weeks share a month; every bar of the other intervals is a period of its own
    if (interval === 'week' && month === previous) continue;
    previous = month;
    if (month % every !== 0) continue;
    if ((index - last) * slot < minGap) continue;
    last = index;
    labels.push({ index, month, year: date.getFullYear(), major: month === 0 });
  }
  // the first year of the chart is named even though it began after its January: the axis does not start with a bare 2021
  if (start === 0 && labels[0]?.index !== 0) {
    const year = calendarDay(periodStart(candles[0].t, interval)).getFullYear();
    // on a narrow chart the next label would touch it: that one gives way
    if (labels[0] && labels[0].index * slot < minGap) labels.shift();
    labels.unshift({ index: 0, month: 0, year, major: true });
  }
  return labels;
}

export interface Pane {
  top: number;
  bottom: number;
}

/** Where the parts of the chart sit inside its box, in pixels. */
export interface Layout {
  width: number;
  height: number;
  plotWidth: number;
  padRight: number;
  /** the height of the strip with the chart's own buttons */
  toolbar: number;
  /** the y of the time axis */
  axisY: number;
  main: Pane;
  rsi: Pane | null;
  macd: Pane | null;
  /** the height of the tallest volume bar */
  volume: number;
}

/** The height of the strip with the chart's own buttons (the panes start under it): a finger needs more room than a mouse. */
export const toolbarHeight = (coarse: boolean): number => (coarse ? 44 : 34);
const AXIS_HEIGHT = 24;
const MIN_MAIN = 96;

/** Splits the box into the price pane and, when asked for, the RSI and MACD panes under it. A narrow box (a phone) has a thinner price scale. */
export function layoutOf(
  width: number,
  height: number,
  sub: { rsi: boolean; macd: boolean },
  toolbar: number,
): Layout {
  const padRight = width < 560 ? 50 : 64;
  const axisY = height - AXIS_HEIGHT;
  const top = toolbar;
  const count = Number(sub.rsi) + Number(sub.macd);
  const room = axisY - top;
  const paneHeight =
    count === 0
      ? 0
      : Math.max(
          44,
          Math.min(
            room * (count === 1 ? 0.28 : 0.2),
            (room - MIN_MAIN) / count,
          ),
        );
  let cursor = axisY;
  let macdPane: Pane | null = null;
  let rsiPane: Pane | null = null;
  if (sub.macd) {
    macdPane = { top: cursor - paneHeight, bottom: cursor };
    cursor -= paneHeight;
  }
  if (sub.rsi) {
    rsiPane = { top: cursor - paneHeight, bottom: cursor };
    cursor -= paneHeight;
  }
  const main = { top, bottom: cursor };
  return {
    width,
    height,
    plotWidth: width - padRight,
    padRight,
    toolbar,
    axisY,
    main,
    rsi: rsiPane,
    macd: macdPane,
    volume: (main.bottom - main.top) * 0.24,
  };
}
