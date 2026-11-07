/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  buildCandles,
  careerAt,
  tickCandle,
  type CareerEntry,
} from '@/skins/trade/blocks/build-candles';

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
const WEEK = 7 * 24 * 60 * 60 * 1000;

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

describe('careerAt', () => {
  it('names the job of a week, the newest when two overlap, and none before the first', () => {
    expect(careerAt(jobs, new Date(2021, 5, 7).getTime())?.id).toBe('a');
    expect(careerAt(jobs, new Date(2022, 4, 2).getTime())?.id).toBe('b');
    // January 2026 is the last month of B and the first of C
    expect(careerAt(jobs, new Date(2026, 0, 12).getTime())?.id).toBe('c');
    expect(careerAt(jobs, new Date(2019, 0, 7).getTime())).toBeNull();
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
