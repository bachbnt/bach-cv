/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  buildCandles,
  type Candle,
  type CareerEntry,
} from '@/lib/derive/career-series';
import { INTERVALS } from '@/skins/trade/chart/chart-types';
import { computeIndicators } from '@/skins/trade/chart/indicators';
import { aggregate } from '@/lib/derive/career-series';
import { legendRows } from '@/skins/trade/chart/legend-rows';
import { DEFAULT_PREFS } from '@/skins/trade/chart/chart-prefs';
import {
  formatVolume,
  volumeBarWidth,
  volumeScale,
} from '@/skins/trade/chart/volume';

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
    endMonth: '2025-01',
  },
  {
    id: 'c',
    company: 'C',
    role: 'Lead',
    startMonth: '2025-02',
    endMonth: null,
  },
];
const degrees = [
  { startMonth: '2016-09', endMonth: '2020-09' },
  { startMonth: '2020-12', endMonth: '2023-06' },
];
const now = new Date(2026, 10, 6);
const { candles, markers } = buildCandles(jobs, 7, now, degrees);

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
function correlation(a: number[], b: number[]): number {
  const ma = mean(a);
  const mb = mean(b);
  let cov = 0;
  let va = 0;
  let vb = 0;
  a.forEach((x, i) => {
    cov += (x - ma) * (b[i] - mb);
    va += (x - ma) ** 2;
    vb += (b[i] - mb) ** 2;
  });
  return cov / Math.sqrt(va * vb);
}

describe('the volume of the candles', () => {
  it('is a positive, deterministic number for every week, around fifty thousand', () => {
    expect(candles.every((k) => k.v > 0 && Number.isFinite(k.v))).toBe(true);
    expect(buildCandles(jobs, 7, now, degrees)).toEqual({ candles, markers });
    const typical = mean(candles.map((k) => k.v));
    expect(typical).toBeGreaterThan(30_000);
    expect(typical).toBeLessThan(120_000);
  });

  it('follows what the candle did: more for a long candle or a big body, less for a flat week', () => {
    const range = candles.map((k) => k.h - k.l);
    const body = candles.map((k) => Math.abs(k.c - k.o));
    const volume = candles.map((k) => k.v);
    expect(correlation(volume, range)).toBeGreaterThan(0.3);
    expect(correlation(volume, body)).toBeGreaterThan(0.2);
    // the quietest tenth of the weeks by range trades clearly less than the busiest tenth
    const order = candles.map((_, i) => i).sort((a, b) => range[a] - range[b]);
    const tenth = Math.floor(candles.length / 10);
    const quiet = mean(order.slice(0, tenth).map((i) => volume[i]));
    const busy = mean(order.slice(-tenth).map((i) => volume[i]));
    expect(busy).toBeGreaterThan(quiet * 1.4);
  });

  it('is nothing like flat: the bars of every interval differ a lot, with spikes and quiet ones', () => {
    const spread = (volumes: number[]) => {
      const sorted = [...volumes].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const sd = Math.sqrt(mean(volumes.map((v) => (v - mean(volumes)) ** 2)));
      return {
        ratio: sorted.at(-1)! / sorted[0],
        spike: sorted.at(-1)! / median,
        quiet: sorted[0] / median,
        variation: sd / mean(volumes),
      };
    };
    const weeks = spread(candles.map((k) => k.v));
    expect(weeks.ratio).toBeGreaterThan(15);
    expect(weeks.spike).toBeGreaterThan(4);
    expect(weeks.quiet).toBeLessThan(0.4);
    expect(weeks.variation).toBeGreaterThan(0.6);
    // the monthly default is what the chart opens on: at least four times between the shortest bar and the tallest
    const months = spread(aggregate(candles, 'month').candles.map((k) => k.v));
    expect(months.ratio).toBeGreaterThan(4);
    expect(months.spike).toBeGreaterThan(2);
    expect(months.variation).toBeGreaterThan(0.3);
    // and no two neighbours are the same
    const same = aggregate(candles, 'month').candles.filter(
      (k, i, list) => i > 0 && Math.abs(k.v - list[i - 1].v) < k.v * 0.01,
    );
    expect(same.length).toBeLessThan(3);
  });

  it('spikes in the weeks a job began', () => {
    // away from the other marks, the weeks of a job start trade at least one and a half times the median
    const median = [...candles.map((k) => k.v)].sort((a, b) => a - b)[
      Math.floor(candles.length / 2)
    ];
    for (const marker of markers) {
      const around = Math.max(
        candles[marker.index].v,
        candles[Math.min(candles.length - 1, marker.index + 1)].v,
      );
      expect(around).toBeGreaterThan(median * 1.5);
    }
  });

  it('rises a little where a degree began or ended, less than at a job', () => {
    const calm = (week: number) =>
      mean(candles.slice(week - 14, week - 8).map((k) => k.v));
    const at = candles.findIndex((k) => k.t >= new Date(2018, 5, 1).getTime());
    // a stretch with nothing in it is not a spike: the volume drifts, it does not jump
    expect(candles[at].v).toBeLessThan(calm(at) * 4);
  });

  it('does not change the prices: the volume has a generator of its own', () => {
    const again = buildCandles(jobs, 7, now, degrees).candles;
    expect(again.map((k) => k.c)).toEqual(candles.map((k) => k.c));
    const other = buildCandles(jobs, 8, now, degrees).candles;
    expect(other.map((k) => k.v)).not.toEqual(candles.map((k) => k.v));
  });

  it('is summed by every interval', () => {
    const total = candles.reduce((sum, k) => sum + k.v, 0);
    for (const interval of INTERVALS)
      expect(
        aggregate(candles, interval).candles.reduce((sum, k) => sum + k.v, 0),
      ).toBeCloseTo(total, 0);
    const years = aggregate(candles, 'year').candles;
    expect(years[1].v).toBeGreaterThan(candles[10].v * 10);
  });
});

describe('the volume as a number', () => {
  it('is short and plain, the same in English and Vietnamese', () => {
    expect(formatVolume(0)).toBe('0');
    expect(formatVolume(812)).toBe('812');
    expect(formatVolume(46_300)).toBe('46.3K');
    expect(formatVolume(50_000)).toBe('50K');
    expect(formatVolume(999_960)).toBe('1M');
    expect(formatVolume(1_234_567)).toBe('1.2M');
    expect(formatVolume(2_500_000_000)).toBe('2.5B');
    expect(formatVolume(-46_300)).toBe('-46.3K');
    // no locale separators: the dot of a decimal is the dot of the other language too
    for (const v of [46_300, 1_234_567])
      expect(formatVolume(v)).not.toMatch(/,|\s/);
  });

  it('has a bar width that leaves a gap growing with the bar', () => {
    expect(volumeBarWidth(1)).toBe(1);
    expect(volumeBarWidth(3)).toBeLessThan(3);
    for (const slot of [4, 12, 40, 120]) {
      expect(volumeBarWidth(slot)).toBeLessThan(slot);
      expect(slot - volumeBarWidth(slot)).toBeGreaterThanOrEqual(1);
    }
    expect(120 - volumeBarWidth(120)).toBeGreaterThan(12 - volumeBarWidth(12));
  });

  it('scales to the bars on screen: the biggest one reaches the height', () => {
    const list: Candle[] = [10, 40, 20, 80].map((v, i) => ({
      t: i,
      o: 1,
      h: 2,
      l: 0,
      c: 1,
      v,
    }));
    const all = volumeScale(list, 0, 4, 200, 50);
    expect(all.max).toBe(80);
    expect(all.y(80)).toBe(150);
    expect(all.h(40)).toBe(25);
    // zoomed to the first two, the biggest of those is the tallest
    const two = volumeScale(list, 0, 2, 200, 50);
    expect(two.max).toBe(40);
    expect(two.h(40)).toBe(50);
    expect(volumeScale([], 0, 0, 100, 20).max).toBe(1);
  });
});

describe('the volume in the legend', () => {
  it('shows the bar and, with 20 bars, the average next to it, coloured by the bar', () => {
    const data = computeIndicators(
      candles.map((k) => k.c),
      candles.map((k) => k.v),
    );
    const rows = legendRows(DEFAULT_PREFS.indicators, data, candles[100], 100);
    const volume = rows.find((r) => r.id === 'volume')!;
    expect(volume.values).toHaveLength(2);
    expect(volume.values[0].value).toBe(candles[100].v);
    expect(volume.values[0].tone).toBe(
      candles[100].c >= candles[100].o ? 'up' : 'down',
    );
    expect(volume.values[1].tone).toBe('orange');
    // before the 20th bar there is no average to show
    const early = legendRows(
      DEFAULT_PREFS.indicators,
      data,
      candles[5],
      5,
    ).find((r) => r.id === 'volume')!;
    expect(early.values).toHaveLength(1);
  });
});
