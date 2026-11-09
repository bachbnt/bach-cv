/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  INTERVALS,
  WEEK_MS,
  aggregate,
  barOfWeek,
  buildCandles,
  markersOn,
  periodEnd,
  periodStart,
  tickCandle,
  type Candle,
  type CareerEntry,
  type CareerMarker,
} from '@/lib/derive/career-series';

const now = new Date(2026, 10, 6); // 6 Nov 2026
const jobs: CareerEntry[] = [
  {
    id: 'a',
    company: 'A',
    role: 'Junior',
    startMonth: '2020-03',
    endMonth: '2022-04',
  },
  {
    id: 'b',
    company: 'B',
    role: 'Senior',
    startMonth: '2022-05',
    endMonth: '2026-01',
  },
  {
    id: 'c',
    company: 'C',
    role: 'Lead',
    startMonth: '2026-01',
    endMonth: null,
  },
];
const WEEK = WEEK_MS;

describe('buildCandles', () => {
  it('is the same chart for the same seed and another one for another seed', () => {
    expect(buildCandles(jobs, 7, now)).toEqual(buildCandles(jobs, 7, now));
    expect(buildCandles(jobs, 8, now).candles[5]).not.toEqual(
      buildCandles(jobs, 7, now).candles[5],
    );
  });

  it('has one candle per week from the first job to now', () => {
    const { candles } = buildCandles(jobs, 7, now);
    const first = new Date(2020, 2, 1).getTime();
    expect(candles[0].t).toBe(first);
    expect(candles).toHaveLength(
      Math.floor((now.getTime() - first) / WEEK) + 1,
    );
    expect(candles[1].t - candles[0].t).toBe(WEEK);
  });

  it('keeps every candle well formed', () => {
    for (const k of buildCandles(jobs, 7, now).candles) {
      expect(k.h).toBeGreaterThanOrEqual(Math.max(k.o, k.c));
      expect(k.l).toBeLessThanOrEqual(Math.min(k.o, k.c));
      expect(k.l).toBeGreaterThan(0);
      expect(k.v).toBeGreaterThan(0);
    }
  });

  it.each([1, 2, 3, 7, 11, 19, 42])(
    'has visible ups and downs, rises overall and ends near its top (seed %i)',
    (seed) => {
      const { candles } = buildCandles(jobs, seed, now);
      const green = candles.filter((k) => k.c >= k.o).length / candles.length;
      expect(green).toBeGreaterThanOrEqual(0.45);
      expect(green).toBeLessThanOrEqual(0.6);
      const last = candles[candles.length - 1].c;
      expect(last).toBeGreaterThanOrEqual(candles[0].c);
      const peak = Math.max(...candles.map((k) => k.c));
      expect(last).toBeGreaterThanOrEqual(peak * 0.98);
    },
  );

  it('puts a flag on the week each job started, and a star on the current one', () => {
    const { candles, markers } = buildCandles(jobs, 7, now);
    expect(markers.map((m) => m.id)).toEqual(['a', 'b', 'c']);
    for (const m of markers) {
      const start = new Date(
        Number(jobs.find((j) => j.id === m.id)!.startMonth.slice(0, 4)),
        Number(jobs.find((j) => j.id === m.id)!.startMonth.slice(5)) - 1,
        1,
      ).getTime();
      const week = candles[m.index].t;
      expect(start).toBeGreaterThanOrEqual(week);
      expect(start - week).toBeLessThan(WEEK);
    }
    expect(markers.map((m) => m.current)).toEqual([false, false, true]);
  });

  it('draws nothing, and does not crash, with no job or with only a future one', () => {
    expect(buildCandles([], 7, now)).toEqual({ candles: [], markers: [] });
    expect(
      buildCandles(
        [{ ...jobs[0], startMonth: '2030-01', endMonth: null }],
        7,
        now,
      ),
    ).toEqual({ candles: [], markers: [] });
    expect(
      buildCandles(
        [{ ...jobs[0], startMonth: 'soon', endMonth: null }],
        7,
        now,
      ),
    ).toEqual({ candles: [], markers: [] });
  });

  it('draws one candle for a job that starts this month', () => {
    const { candles, markers } = buildCandles(
      [{ ...jobs[2], startMonth: '2026-11' }],
      7,
      now,
    );
    expect(candles).toHaveLength(1);
    expect(markers[0].index).toBe(0);
  });
});

describe('tickCandle', () => {
  const last = { t: 0, o: 100, h: 104, l: 98, c: 102, v: 50 };
  it('is a pure function of the step and keeps the candle well formed', () => {
    expect(tickCandle(last, 3)).toEqual(tickCandle(last, 3));
    for (let step = 1; step < 60; step++) {
      const k = tickCandle(last, step);
      expect(Math.abs(k.c - last.c)).toBeLessThanOrEqual(0.7 + 1e-9);
      expect(k.h).toBeGreaterThanOrEqual(Math.max(k.o, k.c));
      expect(k.l).toBeLessThanOrEqual(Math.min(k.o, k.c));
    }
  });
});

// ---------------------------------------------------------------- the intervals (aggregate, periods, flags on the bars)

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

describe('aggregating weekly candles', () => {
  it('gives the weekly candles back as they are', () => {
    const list = weekly(10);
    const bars = aggregate(list, 'week');
    expect(bars.candles).toBe(list);
    expect(bars.starts).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('builds a candle for each calendar month: first open, highest high, lowest low, last close, summed volume', () => {
    // weeks start on 1, 8, 15, 22, 29 January, then 5 February ...
    const list = weekly(12);
    const bars = aggregate(list, 'month');
    expect(bars.candles).toHaveLength(3);
    const [jan, feb] = bars.candles;
    expect(jan).toEqual({
      t: list[0].t,
      o: list[0].o,
      c: list[4].c,
      h: list[4].h,
      l: list[4].l,
      v: 50,
    });
    expect(feb.t).toBe(list[5].t);
    expect(feb.o).toBe(list[5].o);
    expect(bars.starts).toEqual([0, 5, 9, 12]);
    // the last month is the partial one so far: 4 weeks of March ... here 9, 10 and 11
    expect(bars.candles[2].v).toBe(30);
    expect(bars.candles[2].c).toBe(list[11].c);
  });

  it('builds quarters and years, the last one partial', () => {
    const list = weekly(60);
    const quarters = aggregate(list, 'quarter');
    expect(quarters.candles.map((k) => new Date(k.t).getMonth())).toEqual([
      0, 3, 6, 9, 0,
    ]);
    const years = aggregate(list, 'year');
    expect(years.candles).toHaveLength(2);
    expect(years.candles[0].o).toBe(list[0].o);
    // 2020 is a leap year: 53 weeks start in it, the last one on 30 December
    expect(years.starts).toEqual([0, 53, 60]);
    expect(years.candles[1].v).toBe(70);
    expect(years.candles[1].c).toBe(list[59].c);
    expect(years.ends).toEqual([list[52].t, list[59].t]);
  });

  it('keeps the totals whatever the interval', () => {
    const { candles } = buildCandles(
      [
        {
          id: 'a',
          company: 'A',
          role: 'Dev',
          startMonth: '2020-03',
          endMonth: null,
        },
      ],
      7,
      new Date(2026, 10, 6),
    );
    const total = candles.reduce((sum, k) => sum + k.v, 0);
    for (const interval of INTERVALS) {
      const bars = aggregate(candles, interval);
      expect(bars.candles.reduce((sum, k) => sum + k.v, 0)).toBeCloseTo(
        total,
        6,
      );
      expect(bars.candles[0].o).toBe(candles[0].o);
      expect(bars.candles.at(-1)?.c).toBe(candles.at(-1)?.c);
      expect(Math.max(...bars.candles.map((k) => k.h))).toBe(
        Math.max(...candles.map((k) => k.h)),
      );
      for (const k of bars.candles) {
        expect(k.h).toBeGreaterThanOrEqual(Math.max(k.o, k.c));
        expect(k.l).toBeLessThanOrEqual(Math.min(k.o, k.c));
      }
    }
    expect(aggregate(candles, 'year').candles).toHaveLength(7);
  });

  it('handles no career, a single week and a period of one week', () => {
    for (const interval of INTERVALS) {
      expect(aggregate([], interval).candles).toEqual([]);
      const one = weekly(1);
      const bars = aggregate(one, interval);
      expect(bars.candles).toEqual(one);
      expect(bars.starts).toEqual([0, 1]);
    }
    // a bar that holds one week is that week
    const list = weekly(6);
    expect(aggregate(list, 'month').candles[1]).toEqual(list[5]);
  });

  it('does not change the weekly candles it was given', () => {
    const list = weekly(30);
    const copy = structuredClone(list);
    aggregate(list, 'quarter');
    expect(list).toEqual(copy);
  });

  it('finds the bar of a week', () => {
    const bars = aggregate(weekly(12), 'month');
    expect(barOfWeek(bars, 0)).toBe(0);
    expect(barOfWeek(bars, 4)).toBe(0);
    expect(barOfWeek(bars, 5)).toBe(1);
    expect(barOfWeek(bars, 11)).toBe(2);
  });
});

describe('periods', () => {
  it('starts and ends on the calendar', () => {
    const t = new Date(2022, 4, 17).getTime();
    expect(periodStart(t, 'month')).toBe(new Date(2022, 4, 1).getTime());
    expect(periodStart(t, 'quarter')).toBe(new Date(2022, 3, 1).getTime());
    expect(periodStart(t, 'year')).toBe(new Date(2022, 0, 1).getTime());
    expect(periodEnd(t, 'quarter')).toBe(new Date(2022, 6, 1).getTime());
    expect(periodEnd(new Date(2022, 11, 31).getTime(), 'year')).toBe(
      new Date(2023, 0, 1).getTime(),
    );
    expect(periodEnd(t, 'week')).toBe(t + WEEK_MS);
  });
});

describe('the flags on the bars of an interval', () => {
  const jobs: CareerEntry[] = [
    {
      id: 'a',
      company: 'A',
      role: 'Dev',
      startMonth: '2020-01',
      endMonth: '2020-04',
    },
    {
      id: 'b',
      company: 'B',
      role: 'Dev',
      startMonth: '2020-02',
      endMonth: '2020-04',
    },
    {
      id: 'c',
      company: 'C',
      role: 'Lead',
      startMonth: '2021-01',
      endMonth: null,
    },
  ];
  const now = new Date(2021, 5, 1);
  const { candles, markers } = buildCandles(jobs, 3, now);
  const index = (id: string, list: CareerMarker[]) =>
    list.find((m) => m.id === id)?.index;

  it('keeps the weekly flags as they are', () => {
    expect(markersOn(markers, aggregate(candles, 'week'))).toBe(markers);
  });

  it('puts each job on the bar of the period it started in, and two jobs can share a bar', () => {
    const quarters = aggregate(candles, 'quarter');
    const on = markersOn(markers, quarters);
    expect(on).toHaveLength(3);
    expect(index('a', on)).toBe(0);
    // January and February 2020 are the same quarter: one bar, two flags
    expect(index('b', on)).toBe(0);
    // 1 January 2021 is a Friday: the week that holds it started in December, but the job is on the new year
    const years = markersOn(markers, aggregate(candles, 'year'));
    expect(index('a', years)).toBe(0);
    expect(index('c', years)).toBe(1);
    const months = markersOn(markers, aggregate(candles, 'month'));
    expect(index('a', months)).toBe(0);
    expect(index('b', months)).toBe(1);
    expect(
      new Date(aggregate(candles, 'month').candles[12].t).getFullYear(),
    ).toBe(2021);
    expect(index('c', months)).toBe(12);
  });
});
