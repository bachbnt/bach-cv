/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { WEEK_MS, aggregate, type Candle } from '@/lib/derive/career-series';
import { barLabeler } from '@/skins/trade/chart/bar-label';
import { parsePrefs } from '@/skins/trade/chart/chart-prefs';
import { INTERVALS } from '@/skins/trade/chart/chart-types';
import { barAtTime, barsOf, rangeBars } from '@/skins/trade/chart/intervals';
import {
  availableIndicators,
  computeIndicators,
} from '@/skins/trade/chart/indicators';
import { DEFAULT_PREFS } from '@/skins/trade/chart/chart-prefs';
import { makeAxis } from '@/skins/trade/chart/time-axis';
import { axisLabels, limitsOf } from '@/skins/trade/chart/view';

const first = new Date(2020, 0, 1).getTime();
/** weeks from 1 January 2020: every candle is told apart by its numbers */
const weekly = (n: number): Candle[] =>
  Array.from({ length: n }, (_, i) => ({
    t: first + i * WEEK_MS,
    o: 100 + i,
    c: 101 + i,
    h: 110 + i,
    l: 90 - i,
    v: 10,
  }));

describe('looking bars up', () => {
  it('keeps one result of the aggregate for each interval', () => {
    const list = weekly(30);
    expect(barsOf(list, 'month')).toBe(barsOf(list, 'month'));
    expect(barsOf(list, 'month')).not.toBe(barsOf(list, 'year'));
  });

  it('finds the bar of a date, or the last one when the period has not started', () => {
    const bars = aggregate(weekly(60), 'quarter');
    expect(barAtTime(bars, new Date(2020, 1, 14).getTime())).toBe(0);
    expect(barAtTime(bars, new Date(2020, 4, 1).getTime())).toBe(1);
    expect(barAtTime(bars, new Date(2030, 0, 1).getTime())).toBe(
      bars.candles.length - 1,
    );
  });
});

describe('ranges in bars', () => {
  it('turns spans of time into bars of the interval, never fewer than a few', () => {
    expect(rangeBars(null, 'month')).toBeNull();
    expect(rangeBars(52, 'week')).toBe(52);
    expect(rangeBars(52, 'month')).toBe(12);
    expect(rangeBars(156, 'month')).toBe(36);
    expect(rangeBars(13, 'month')).toBe(6);
    expect(rangeBars(52, 'quarter')).toBe(4);
    expect(rangeBars(156, 'quarter')).toBe(12);
    expect(rangeBars(52, 'year')).toBe(3);
    expect(rangeBars(156, 'year')).toBe(3);
  });
});

describe('the time and the bars, one into the other', () => {
  it('is the straight line it always was on weekly candles', () => {
    const list = weekly(20);
    const axis = makeAxis(list, 'week');
    // the middle of a week is the index of its bar
    expect(axis.index(list[7].t + WEEK_MS / 2)).toBeCloseTo(7, 10);
    expect(axis.time(7)).toBe(list[7].t + WEEK_MS / 2);
    expect(axis.index(list[7].t)).toBeCloseTo(6.5, 10);
    expect(axis.time(-2)).toBe(first - 1.5 * WEEK_MS);
    expect(axis.time(21)).toBe(first + 21.5 * WEEK_MS);
  });

  it('keeps a time where it is when the candles change', () => {
    const list = weekly(100);
    const t = new Date(2020, 6, 15).getTime();
    for (const interval of INTERVALS) {
      const bars = aggregate(list, interval);
      const axis = makeAxis(bars.candles, interval);
      expect(axis.time(axis.index(t))).toBeCloseTo(t, -2);
      // the bar index grows with time
      expect(axis.index(t + 40 * WEEK_MS)).toBeGreaterThan(axis.index(t));
    }
    // 40 weeks are 40 bars of weeks, about 9 of months and less than one of years
    const months = makeAxis(aggregate(list, 'month').candles, 'month');
    expect(months.index(t + 40 * WEEK_MS) - months.index(t)).toBeCloseTo(
      9.2,
      0,
    );
    const years = makeAxis(aggregate(list, 'year').candles, 'year');
    expect(years.index(t + 40 * WEEK_MS) - years.index(t)).toBeLessThan(1);
  });

  it('goes on past both ends and answers for no candles', () => {
    const axis = makeAxis(aggregate(weekly(10), 'year').candles, 'year');
    expect(axis.index(first - 1000)).toBeLessThan(0);
    expect(axis.index(new Date(2025, 0, 1).getTime())).toBeGreaterThan(0);
    expect(makeAxis([], 'week').index(5)).toBe(0);
  });
});

describe('dates of a bar', () => {
  const t = new Date(2022, 4, 17).getTime();
  const en = barLabeler('en', 'Q{quarter} {year}');
  const vi = barLabeler('vi', 'Quý {quarter} {year}');

  it('is the day for a week, "Mon YYYY" for a month, "Qn YYYY" for a quarter and the year for a year', () => {
    expect(en(t, 'week')).toContain('17');
    expect(en(t, 'month')).toBe('May 2022');
    expect(en(t, 'quarter')).toBe('Q2 2022');
    expect(en(t, 'year')).toBe('2022');
  });

  it('is in the language of the visitor', () => {
    expect(vi(t, 'quarter')).toBe('Quý 2 2022');
    expect(vi(t, 'month')).toMatch(/5.*2022/);
    expect(vi(t, 'year')).toBe('2022');
  });

  it('dates the first bar by its period, not by the month the career began in', () => {
    const march = new Date(2020, 2, 1).getTime();
    expect(en(march, 'year')).toBe('2020');
    expect(en(march, 'quarter')).toBe('Q1 2020');
  });
});

describe('the time axis of each interval', () => {
  const list = weekly(300);

  it('labels every year of yearly bars, and the quarters of quarterly ones', () => {
    const years = aggregate(list, 'year');
    const labels = axisLabels(
      years.candles,
      0,
      years.candles.length,
      90,
      'year',
    );
    expect(labels.map((l) => l.year)).toEqual([
      2020, 2021, 2022, 2023, 2024, 2025,
    ]);
    expect(labels.every((l) => l.major)).toBe(true);
    const quarters = aggregate(list.slice(0, 60), 'quarter');
    const some = axisLabels(
      quarters.candles,
      0,
      quarters.candles.length,
      60,
      'quarter',
    );
    expect(some.length).toBeGreaterThan(1);
    expect(some[0]).toMatchObject({ month: 0, year: 2020, major: true });
  });

  it('names the first year of the chart at its first bar, also on a narrow chart where the next label gives way', () => {
    // a chart that begins in March, as the career does
    const months = aggregate(
      list.map((k, i) => ({
        ...k,
        t: new Date(2020, 2, 1).getTime() + i * WEEK_MS,
      })),
      'month',
    );
    const wide = axisLabels(
      months.candles,
      0,
      months.candles.length,
      12,
      'month',
    );
    expect(wide.slice(0, 2).map((l) => [l.index, l.year])).toEqual([
      [0, 2020],
      [10, 2021],
    ]);
    const narrow = axisLabels(
      months.candles,
      0,
      months.candles.length,
      4,
      'month',
    );
    expect(narrow[0]).toMatchObject({ index: 0, year: 2020, major: true });
    expect(narrow[1].year).toBeGreaterThan(2021);
    // a window that does not start at the first bar has no such label
    expect(
      axisLabels(months.candles, 30, 60, 12, 'month')[0].index,
    ).toBeGreaterThan(29);
  });

  it('keeps the labels apart', () => {
    const months = aggregate(list, 'month');
    const labels = axisLabels(
      months.candles,
      0,
      months.candles.length,
      20,
      'month',
    );
    for (let i = 1; i < labels.length; i++)
      expect(
        (labels[i].index - labels[i - 1].index) * 20,
      ).toBeGreaterThanOrEqual(44);
  });
});

describe('indicators with few bars', () => {
  const data = (n: number) =>
    computeIndicators(aggregate(weekly(n), 'year').candles.map((k) => k.c));

  it('are not computed into garbage: no value means no indicator', () => {
    const d = data(300);
    expect(d.lines.ma20.every((v) => v === null)).toBe(true);
    expect(d.rsi.every((v) => v === null)).toBe(true);
    expect(d.macd.histogram.every((v) => v === null)).toBe(true);
    expect(() => computeIndicators([])).not.toThrow();
    expect(() => computeIndicators([5])).not.toThrow();
  });

  it('are left out when they have no value, and the choice is kept for the interval that has enough bars', () => {
    const on = {
      ...DEFAULT_PREFS.indicators,
      ma50: 'shown' as const,
      rsi: 'shown' as const,
      macd: 'hidden' as const,
    };
    const few = availableIndicators(on, data(300));
    expect(few.volume).toBe('shown');
    expect(few.ma20).toBe('off');
    expect(few.ma50).toBe('off');
    expect(few.rsi).toBe('off');
    expect(few.macd).toBe('off');
    expect(on.rsi).toBe('shown');
    const weeks = computeIndicators(weekly(300).map((k) => k.c));
    expect(availableIndicators(on, weeks)).toBe(on);
    const quarters = computeIndicators(
      aggregate(weekly(300), 'quarter').candles.map((k) => k.c),
    );
    const mid = availableIndicators(on, quarters);
    expect(mid.ma20).toBe('shown');
    expect(mid.ma50).toBe('off');
    expect(mid.rsi).toBe('shown');
  });
});

describe('the interval that is kept', () => {
  it('is month unless the stored value is one of the four', () => {
    expect(parsePrefs(null).interval).toBe('month');
    expect(parsePrefs('{"interval":"month"}').interval).toBe('month');
    expect(parsePrefs('{"interval":"decade"}').interval).toBe('month');
    expect(parsePrefs('{"interval":"week"}').interval).toBe('week');
    expect(parsePrefs('{"interval":3}').interval).toBe('month');
  });

  it('has limits of its own', () => {
    expect(limitsOf(7, 'year').minSpan).toBeLessThan(
      limitsOf(7, 'week').minSpan,
    );
  });
});
