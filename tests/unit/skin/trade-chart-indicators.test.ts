/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import type { Candle } from '@/skins/trade/blocks/build-candles';
import { DEFAULT_PREFS } from '@/skins/trade/chart/chart-prefs';
import { INDICATOR_IDS } from '@/skins/trade/chart/chart-types';
import {
  INDICATOR_INFO,
  OVERLAYS,
  availableIndicators,
  bollinger,
  computeIndicators,
  ema,
  extent,
  macd,
  rsi,
  sma,
} from '@/skins/trade/chart/indicators';
import { heikinAshi, isLineType, seriesFor } from '@/skins/trade/chart/series';

describe('moving averages', () => {
  it('averages the last values and waits for enough of them', () => {
    expect(sma([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
    expect(sma([5], 3)).toEqual([null]);
  });

  it('starts the exponential average from the simple one', () => {
    // seed (10 + 11 + 12) / 3 = 11, then k = 2 / (3 + 1) = 0.5
    expect(ema([10, 11, 12, 13, 14, 15], 3)).toEqual([
      null,
      null,
      11,
      12,
      13,
      14,
    ]);
  });
});

describe('Bollinger Bands', () => {
  it('puts the bands two standard deviations of the window around the average', () => {
    const { mid, upper, lower } = bollinger([1, 2, 3, 4, 5], 5, 2);
    // the population deviation of 1..5 is the square root of 2
    expect(mid[4]).toBe(3);
    expect(upper[4]).toBeCloseTo(3 + 2 * Math.SQRT2, 10);
    expect(lower[4]).toBeCloseTo(3 - 2 * Math.SQRT2, 10);
    expect(upper.slice(0, 4)).toEqual([null, null, null, null]);
  });

  it('collapses the bands on a flat series', () => {
    const { mid, upper, lower } = bollinger(Array(25).fill(50), 20, 2);
    expect(upper[24]).toBe(mid[24]);
    expect(lower[24]).toBe(mid[24]);
  });
});

describe('RSI', () => {
  // the worked example of Wilder's smoothing that is printed in most text books. They round their steps, so they print
  // 70.53, 66.32, 66.55, 69.41, 66.36 and 57.97; these are the unrounded values, which an independent calculation gives too.
  const closes = [
    44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08, 45.89,
    46.03, 45.61, 46.28, 46.28, 46.0, 46.03, 46.41, 46.22, 45.64,
  ];

  it('matches the known values of the example', () => {
    const values = rsi(closes, 14);
    expect(values.slice(0, 14).every((v) => v === null)).toBe(true);
    const known = [
      70.464135, 66.249619, 66.480942, 69.346853, 66.294713, 57.915021,
    ];
    known.forEach((value, k) => expect(values[14 + k]).toBeCloseTo(value, 5));
    // and they are within a tenth of the rounded ones of the book
    [70.53, 66.32, 66.55, 69.41, 66.36, 57.97].forEach((value, k) =>
      expect(Math.abs((values[14 + k] as number) - value)).toBeLessThan(0.1),
    );
  });

  it('is 100 for a series that only rises, 0 for one that only falls, 50 when nothing moves', () => {
    expect(
      rsi(
        Array.from({ length: 30 }, (_, i) => i),
        14,
      )[29],
    ).toBe(100);
    expect(
      rsi(
        Array.from({ length: 30 }, (_, i) => -i),
        14,
      )[29],
    ).toBe(0);
    expect(rsi(Array(30).fill(7), 14)[29]).toBe(50);
  });

  it('has nothing to say about a series shorter than its period', () => {
    expect(rsi([1, 2, 3], 14)).toEqual([null, null, null]);
  });
});

describe('MACD', () => {
  const values = Array.from(
    { length: 80 },
    (_, i) => 100 + Math.sin(i / 5) * 8 + i * 0.3,
  );

  it('is the fast average minus the slow one, with a signal line and a histogram', () => {
    const { macd: line, signal, histogram } = macd(values, 12, 26, 9);
    const fast = ema(values, 12);
    const slow = ema(values, 26);
    // the line starts when the slow average does, the signal nine bars later
    expect(line.findIndex((v) => v !== null)).toBe(25);
    expect(signal.findIndex((v) => v !== null)).toBe(33);
    for (const i of [25, 40, 79])
      expect(line[i]).toBeCloseTo(
        (fast[i] as number) - (slow[i] as number),
        10,
      );
    for (const i of [33, 50, 79])
      expect(histogram[i]).toBeCloseTo(
        (line[i] as number) - (signal[i] as number),
        10,
      );
    expect(histogram[30]).toBeNull();
  });

  it('is zero on a flat series', () => {
    const { macd: line, signal } = macd(Array(60).fill(10), 12, 26, 9);
    expect(line[59]).toBeCloseTo(0, 10);
    expect(signal[59]).toBeCloseTo(0, 10);
  });
});

describe('extent', () => {
  it('finds the lowest and highest defined value of a window', () => {
    expect(extent([[null, 3, 1, 8, 5]], 1, 4)).toEqual([1, 8]);
    expect(extent([[null, null]], 0, 2)).toBeNull();
    expect(
      extent(
        [
          [1, 9],
          [4, 2],
        ],
        0,
        2,
      ),
    ).toEqual([1, 9]);
  });
});

describe('computeIndicators', () => {
  it('has every indicator, as long as the series', () => {
    const data = computeIndicators(
      Array.from({ length: 120 }, (_, i) => 50 + i),
    );
    expect(data.lines.ma20).toHaveLength(120);
    expect(data.lines.ma50[49]).toBe(74.5);
    expect(data.bollinger.upper).toHaveLength(120);
    expect(data.macd.histogram).toHaveLength(120);
  });
});

describe('the moving averages of the chart', () => {
  // closes 1, 2, 3 ... 250: the average of n of them ending at close k is k - (n - 1) / 2
  const closes = Array.from({ length: 250 }, (_, i) => i + 1);
  const data = computeIndicators(closes);

  it('are made from one list: an average of 20, 50, 100 and 200 bars, simple and exponential', () => {
    expect(OVERLAYS.map((o) => o.id)).toEqual([
      'ma20',
      'ma50',
      'ma100',
      'ma200',
      'ema20',
      'ema50',
      'ema100',
      'ema200',
    ]);
    for (const o of OVERLAYS) {
      expect(data.lines[o.id]).toHaveLength(250);
      // nothing before the bar that has a whole period behind it
      expect(data.lines[o.id][o.period - 2]).toBeNull();
      expect(data.lines[o.id][o.period - 1]).not.toBeNull();
      expect(INDICATOR_INFO[o.id].needs).toBe(o.period);
    }
  });

  it('have the values worked out by hand', () => {
    // simple averages: the mean of the last n closes
    expect(data.lines.ma20[19]).toBe(10.5);
    expect(data.lines.ma100[99]).toBe(50.5);
    expect(data.lines.ma100[249]).toBe(200.5);
    expect(data.lines.ma200[199]).toBe(100.5);
    expect(data.lines.ma200[249]).toBe(150.5);
    // exponential: the simple average of the first n closes, then k = 2 / (n + 1)
    expect(data.lines.ema20[19]).toBe(10.5);
    const k20 = 2 / 21;
    expect(data.lines.ema20[20]).toBeCloseTo(21 * k20 + 10.5 * (1 - k20), 10);
    expect(data.lines.ema50[49]).toBe(25.5);
    expect(data.lines.ema100[99]).toBe(50.5);
    expect(data.lines.ema200[199]).toBe(100.5);
    // on a rising line an exponential average is above the simple one of the same length
    expect(data.lines.ema50[249]!).toBeGreaterThan(data.lines.ma50[249]!);
    // and a longer average lags more
    expect(data.lines.ma200[249]!).toBeLessThan(data.lines.ma20[249]!);
  });

  it('have no value at all when there are fewer bars than the period, and nothing is made up', () => {
    const few = computeIndicators(closes.slice(0, 80));
    expect(few.lines.ma100.every((v) => v === null)).toBe(true);
    expect(few.lines.ma200.every((v) => v === null)).toBe(true);
    expect(few.lines.ema100.every((v) => v === null)).toBe(true);
    expect(few.lines.ma50.filter((v) => v !== null)).toHaveLength(31);
    const on = {
      ...DEFAULT_PREFS.indicators,
      ma100: 'shown' as const,
      ma50: 'shown' as const,
    };
    const shown = availableIndicators(on, few);
    expect(shown.ma100).toBe('off');
    expect(shown.ma50).toBe('shown');
    // the choice is kept: with enough bars it draws again
    expect(on.ma100).toBe('shown');
    expect(availableIndicators(on, data).ma100).toBe('shown');
  });
});

describe('the indicators a first visit shows', () => {
  it('are the volume, the average of 20 bars and the exponential average of 50, and the rest are off', () => {
    const on = INDICATOR_IDS.filter(
      (id) => DEFAULT_PREFS.indicators[id] === 'shown',
    );
    expect(on).toEqual(['volume', 'ma20', 'ema50']);
    expect(Object.keys(DEFAULT_PREFS.indicators)).toEqual([...INDICATOR_IDS]);
  });

  it('have a group each, for the Indicators window', () => {
    expect(INDICATOR_INFO.ma20.group).toBe('moving');
    expect(INDICATOR_INFO.ema200.group).toBe('moving');
    expect(INDICATOR_INFO.bollinger.group).toBe('volatility');
    expect(INDICATOR_INFO.rsi.group).toBe('oscillators');
    expect(INDICATOR_INFO.macd.group).toBe('oscillators');
    expect(INDICATOR_INFO.volume.group).toBe('volume');
    expect(INDICATOR_INFO.ma200.needs).toBe(200);
  });

  it('each have a colour of their own among the averages', () => {
    const tones = OVERLAYS.map((o) => o.tone);
    expect(new Set(tones).size).toBe(OVERLAYS.length);
  });
});

describe('Heikin Ashi', () => {
  const candles: Candle[] = [
    { t: 1, o: 10, h: 14, l: 9, c: 12, v: 5 },
    { t: 2, o: 12, h: 16, l: 11, c: 15, v: 6 },
    { t: 3, o: 15, h: 15.5, l: 10, c: 11, v: 7 },
  ];

  it('averages the week and opens in the middle of the last body', () => {
    const [a, b, c] = heikinAshi(candles);
    expect(a).toEqual({ t: 1, o: 11, c: 11.25, h: 14, l: 9, v: 5 });
    expect(b.o).toBeCloseTo((11 + 11.25) / 2, 10);
    expect(b.c).toBeCloseTo((12 + 16 + 11 + 15) / 4, 10);
    for (const k of [a, b, c]) {
      expect(k.h).toBeGreaterThanOrEqual(Math.max(k.o, k.c));
      expect(k.l).toBeLessThanOrEqual(Math.min(k.o, k.c));
    }
    expect(c.v).toBe(7);
  });

  it('is only used for its own chart type', () => {
    expect(seriesFor('candles', candles)).toBe(candles);
    expect(seriesFor('heikin', candles)).not.toBe(candles);
    expect(isLineType('area')).toBe(true);
    expect(isLineType('bars')).toBe(false);
  });
});
