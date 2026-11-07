/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import type { Candle } from '@/skins/trade/blocks/build-candles';
import { barsOf } from '@/skins/trade/chart/intervals';
import { makeAxis } from '@/skins/trade/chart/time-axis';
import { buildFrame } from '@/skins/trade/chart/frame';
import { DEFAULT_PREFS } from '@/skins/trade/chart/chart-prefs';
import { computeIndicators } from '@/skins/trade/chart/indicators';
import {
  areaPath,
  bandPath,
  barPaths,
  candlePaths,
  closeLine,
  histogramPaths,
  linePath,
  volumePaths,
} from '@/skins/trade/chart/paths';
import {
  activeRange,
  axisLabels,
  centerView,
  clampView,
  followView,
  layoutOf,
  limitsOf,
  makePriceScale,
  makeTimeScale,
  niceTicks,
  panView,
  rangeView,
  retargetView,
  visibleBars,
  zoomView,
} from '@/skins/trade/chart/view';

const WEEK = 7 * 24 * 60 * 60 * 1000;
const candles = (n: number, start = new Date(2024, 0, 1).getTime()): Candle[] =>
  Array.from({ length: n }, (_, i) => ({
    t: start + i * WEEK,
    o: 100 + i,
    c: i % 2 === 0 ? 101 + i : 99 + i,
    h: 103 + i,
    l: 97 + i,
    v: 10 + i,
  }));

const week = (count: number) => limitsOf(count, 'week');
const PAD = week(0).pad;

describe('the window of the chart', () => {
  it('shows the last bars of a range with the empty slots after them, or everything', () => {
    expect(rangeView(week(300), 52)).toEqual({ from: 248, span: 52 + PAD });
    expect(rangeView(week(30), 52)).toEqual({ from: 0, span: 30 + PAD });
    expect(rangeView(week(300), null)).toEqual({ from: 0, span: 300 + PAD });
  });

  it('knows which range button the window is on, and none after a zoom', () => {
    const limits = week(300);
    expect(activeRange(rangeView(limits, 156), limits, 'week')).toBe('y3');
    expect(activeRange(rangeView(limits, null), limits, 'week')).toBe('all');
    expect(
      activeRange(
        zoomView(rangeView(limits, 52), 0.5, 0.5, limits),
        limits,
        'week',
      ),
    ).toBeNull();
  });

  it('turns the ranges, which are spans of time, into bars of the interval, never too few', () => {
    const year = limitsOf(7, 'year');
    // 3M, 6M, 1Y and 3Y are all "the last three years" on yearly bars: the one asked for is the one that is pressed
    for (const key of ['m3', 'm6', 'y1', 'y3'] as const) {
      const view = rangeView(year, 3);
      expect(activeRange(view, year, 'year', key)).toBe(key);
    }
    expect(activeRange(rangeView(year, 3), year, 'year')).toBe('y3');
    expect(rangeView(year, 3).span).toBeGreaterThanOrEqual(year.minSpan);
    expect(activeRange(rangeView(year, null), year, 'year')).toBe('all');
    const month = limitsOf(80, 'month');
    expect(activeRange(rangeView(month, 12), month, 'month')).toBe('y1');
  });

  it('zooms around the bar under the pointer', () => {
    const limits = week(400);
    const view = { from: 100, span: 100 };
    const zoomed = zoomView(view, 0.5, 0.25, limits);
    expect(zoomed.span).toBe(50);
    // the bar a quarter of the way across stays a quarter of the way across
    expect(zoomed.from + zoomed.span * 0.25).toBeCloseTo(125, 10);
    expect(zoomView(view, 0.001, 0.5, limits).span).toBe(8);
    expect(zoomView(view, 100, 0.5, limits).span).toBe(404);
  });

  it('has its own limits for each interval: a yearly chart may show fewer bars', () => {
    const year = limitsOf(7, 'year');
    expect(zoomView({ from: 0, span: 8 }, 0.001, 0.5, year).span).toBe(
      year.minSpan,
    );
    expect(year.minSpan).toBeLessThan(week(7).minSpan);
    expect(zoomView({ from: 0, span: 8 }, 100, 0.5, year).span).toBe(
      7 + year.pad,
    );
  });

  it('pans, and never leaves the data behind', () => {
    const limits = week(400);
    const view = { from: 100, span: 50 };
    expect(panView(view, -30, limits).from).toBe(70);
    expect(panView(view, 9999, limits).from).toBe(397);
    expect(panView(view, -9999, limits).from).toBe(3 - 50);
    expect(clampView({ from: 5, span: 2 }, limits).span).toBe(8);
  });

  it('centres on a bar and follows a playhead that runs off the right edge', () => {
    const limits = week(400);
    const view = { from: 100, span: 40 };
    expect(centerView(view, 200, limits).from).toBeCloseTo(180.5, 10);
    expect(followView(view, 120, limits)).toBe(view);
    const moved = followView(view, 150, limits);
    expect(moved.from).toBeGreaterThan(view.from);
    expect(moved.from + moved.span - PAD).toBeGreaterThanOrEqual(151);
  });

  it('keeps the centre of the window on the same date when the interval changes', () => {
    const weekly = candles(300, new Date(2020, 2, 1).getTime());
    const weeks = makeAxis(weekly, 'week');
    const bars = barsOf(weekly, 'month');
    const months = makeAxis(bars.candles, 'month');
    const view = { from: 100, span: 60 };
    const centre = weeks.time(view.from + view.span / 2 - 0.5);
    const next = retargetView(
      view,
      weeks,
      months,
      limitsOf(bars.candles.length, 'month'),
    );
    const after = months.time(next.from + next.span / 2 - 0.5);
    expect(Math.abs(after - centre)).toBeLessThan(WEEK);
    // 60 weeks are about 14 months
    expect(next.span).toBeGreaterThan(12);
    expect(next.span).toBeLessThan(16);
  });

  it('keeps the window on the same dates when bars are added at the front of the series', () => {
    // the career grows backwards (a degree that began before the first job): every bar number moves, no date does
    const later = candles(100, new Date(2020, 2, 1).getTime());
    const earlier = candles(280, new Date(2016, 8, 1).getTime());
    const axisBefore = makeAxis(later, 'week');
    const axisAfter = makeAxis(earlier, 'week');
    const view = { from: 40, span: 30 };
    const left = axisBefore.time(view.from - 0.5);
    const right = axisBefore.time(view.from + view.span - 0.5);
    const next = retargetView(view, axisBefore, axisAfter, week(280));
    expect(axisAfter.time(next.from - 0.5)).toBeCloseTo(left, -3);
    expect(axisAfter.time(next.from + next.span - 0.5)).toBeCloseTo(right, -3);
    // the same bars index would have slid the window back by years
    expect(next.from).toBeGreaterThan(view.from + 150);
    expect(next.span).toBeCloseTo(view.span, 6);
    // and the other way, when the series loses its early bars
    const back = retargetView(next, axisAfter, axisBefore, week(100));
    expect(back.from).toBeCloseTo(view.from, 6);
    expect(back.span).toBeCloseTo(view.span, 6);
  });

  it('never makes a window shorter than the interval allows, and slides it back to the last bar', () => {
    const weekly = candles(300, new Date(2020, 2, 1).getTime());
    const years = barsOf(weekly, 'year');
    const limits = limitsOf(years.candles.length, 'year');
    const next = retargetView(
      { from: 280, span: 13 },
      makeAxis(weekly, 'week'),
      makeAxis(years.candles, 'year'),
      limits,
    );
    expect(next.span).toBe(limits.minSpan);
    expect(next.from + next.span).toBeLessThanOrEqual(
      limits.count + limits.pad + 1e-9,
    );
  });

  it('maps a bar to a place and a place to a bar', () => {
    const ts = makeTimeScale({ from: 10, span: 20 }, 400);
    expect(ts.slot).toBe(20);
    expect(ts.x(10)).toBe(10);
    expect(ts.barAt(ts.x(17))).toBe(17);
    expect(ts.indexAt(ts.x(17.5))).toBeCloseTo(17.5, 10);
    expect(ts.body).toBe(14);
  });

  it('lists only the bars on screen, inside the data', () => {
    expect(visibleBars({ from: 10.4, span: 20 }, 300)).toEqual({
      start: 10,
      end: 31,
    });
    expect(visibleBars({ from: -5, span: 20 }, 300)).toEqual({
      start: 0,
      end: 15,
    });
    expect(visibleBars({ from: 290, span: 40 }, 300)).toEqual({
      start: 290,
      end: 300,
    });
  });
});

describe('the price scale', () => {
  it('maps a price to a height and back, in a line and in logarithms', () => {
    for (const log of [false, true]) {
      const scale = makePriceScale(50, 200, 20, 220, log);
      expect(scale.y(50)).toBeCloseTo(220, 8);
      expect(scale.y(200)).toBeCloseTo(20, 8);
      expect(scale.y(123.4)).toBeLessThan(scale.y(100));
      expect(scale.priceAt(scale.y(123.4))).toBeCloseTo(123.4, 6);
    }
    // in logarithms the middle of the pane is the geometric mean
    expect(makePriceScale(50, 200, 0, 100, true).priceAt(50)).toBeCloseTo(
      100,
      6,
    );
  });

  it('gives round grid prices inside the range', () => {
    const ticks = niceTicks(72, 191);
    expect(ticks.length).toBeGreaterThanOrEqual(4);
    expect(ticks.length).toBeLessThanOrEqual(9);
    for (const t of ticks) {
      expect(t).toBeGreaterThanOrEqual(72);
      expect(t).toBeLessThanOrEqual(191);
      expect(t % 5).toBe(0);
    }
    expect(niceTicks(5, 5)).toEqual([5]);
  });
});

describe('the time axis', () => {
  it('labels the years of a long range and the months of a short one, spaced apart', () => {
    const long = candles(300, new Date(2020, 2, 1).getTime());
    const years = axisLabels(long, 0, 300, 3, 'week');
    expect(years.every((l) => l.major && l.month === 0)).toBe(true);
    // the year the chart begins in is named at its first bar, though its January is before it
    expect(years.map((l) => l.year)).toEqual([
      2020, 2021, 2022, 2023, 2024, 2025,
    ]);
    expect(years[0]).toMatchObject({ index: 0, major: true });
    const short = candles(13, new Date(2026, 0, 5).getTime());
    const months = axisLabels(short, 0, 13, 40, 'week');
    expect(months.map((l) => l.month)).toEqual([0, 1, 2]);
    for (let i = 1; i < months.length; i++)
      expect(
        (months[i].index - months[i - 1].index) * 40,
      ).toBeGreaterThanOrEqual(44);
    expect(axisLabels(candles(1), 0, 1, 10, 'week')).toEqual([]);
  });
});

describe('the panes', () => {
  it('keeps one price pane alone, and puts the RSI and MACD panes under it', () => {
    const alone = layoutOf(900, 400, { rsi: false, macd: false }, 34);
    expect(alone.main).toEqual({ top: 34, bottom: 376 });
    expect(alone.rsi).toBeNull();
    const both = layoutOf(900, 400, { rsi: true, macd: true }, 34);
    expect(both.rsi?.bottom).toBe(both.macd?.top);
    expect(both.macd?.bottom).toBe(both.axisY);
    expect(both.main.bottom).toBe(both.rsi?.top);
    expect(both.main.bottom - both.main.top).toBeGreaterThanOrEqual(96);
  });

  it('gives a narrow box a thinner price scale', () => {
    expect(
      layoutOf(390, 300, { rsi: false, macd: false }, 44).padRight,
    ).toBeLessThan(
      layoutOf(900, 300, { rsi: false, macd: false }, 34).padRight,
    );
  });
});

describe('the frame', () => {
  const list = candles(120);
  const input = {
    width: 900,
    height: 400,
    axis: makeAxis(list, 'week'),
    view: rangeView(week(120), 52),
    series: list,
    type: 'candles' as const,
    indicators: DEFAULT_PREFS.indicators,
    data: computeIndicators(list.map((k) => k.c)),
    log: false,
    toolbar: 34,
    manual: null,
  };

  it('fits the price scale to the candles on screen', () => {
    const frame = buildFrame(input);
    expect(frame.end - frame.start).toBe(52);
    expect(frame.price.y(list[119].h)).toBeGreaterThanOrEqual(
      frame.layout.main.top,
    );
    expect(frame.price.y(list[68].l)).toBeLessThanOrEqual(
      frame.layout.main.bottom,
    );
    expect(frame.rsi).toBeNull();
  });

  it('uses a price range chosen by hand, and makes scales for the panes that are on', () => {
    const manual = buildFrame({ ...input, manual: { lo: 0, hi: 1000 } });
    expect(manual.price.hi).toBe(1000);
    const panes = buildFrame({
      ...input,
      indicators: { ...input.indicators, rsi: 'shown', macd: 'shown' },
    });
    expect(panes.rsi?.y(100)).toBeLessThan(panes.rsi?.y(0) ?? 0);
    expect(panes.macd?.priceAt(panes.macd.y(0))).toBeCloseTo(0, 8);
  });
});

describe('paths', () => {
  const list = candles(4);
  const p = {
    x: (i: number) => i * 10,
    y: (price: number) => 200 - price,
    body: 6,
  };

  it('draws all the candles as four paths, the rising ones apart from the falling ones', () => {
    const paths = candlePaths(list, 0, p);
    // candles 0 and 2 rise (close above open), 1 and 3 fall
    expect(paths.upBody.match(/M/g)).toHaveLength(2);
    expect(paths.downBody.match(/M/g)).toHaveLength(2);
    expect(paths.upWick.match(/M/g)).toHaveLength(2);
    expect(paths.downWick.match(/M/g)).toHaveLength(2);
  });

  it('draws a bar with a stem and two ticks, and a volume bar for each candle', () => {
    const bars = barPaths(list, 0, p);
    expect(bars.up.match(/H/g)).toHaveLength(4);
    const volume = volumePaths(list, 0, p, 300, 50);
    expect((volume.up + volume.down).match(/M/g)).toHaveLength(4);
    expect(volume.down).toContain('v-50');
  });

  it('breaks a line where an indicator has no value yet', () => {
    expect(linePath([null, 1, 2, null, 4], 0, 5, p)).toBe(
      'M10 199L20 198M40 196',
    );
    expect(linePath([null, null], 0, 2, p)).toBe('');
    expect(closeLine(list, 0, p).startsWith('M0 ')).toBe(true);
    expect(areaPath(list, 0, p, 300).endsWith('Z')).toBe(true);
    expect(areaPath([], 0, p, 300)).toBe('');
  });

  it('closes a band between two lines, and splits the histogram at zero', () => {
    expect(bandPath([null, 5, 6], [null, 1, 2], 0, 3, p)).toBe(
      'M10 195L20 194L20 198L10 199Z',
    );
    expect(bandPath([null], [null], 0, 1, p)).toBe('');
    const bars = histogramPaths([1, -1, null], 0, 3, { ...p, y: (v) => -v });
    expect(bars.up).toContain('M-3');
    expect(bars.down).toContain('V1');
  });
});
