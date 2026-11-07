/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Candle } from '@/skins/trade/blocks/build-candles';
import type { ChartType } from '@/skins/trade/chart/chart-types';

/**
 * Heikin Ashi candles: each close is the average of the week, each open the middle of the previous Heikin Ashi body, so the colour
 * changes less often. The volume and the time stay those of the real candle.
 */
export function heikinAshi(candles: Candle[]): Candle[] {
  const result: Candle[] = [];
  candles.forEach((k, i) => {
    const c = (k.o + k.h + k.l + k.c) / 4;
    const o =
      i === 0 ? (k.o + k.c) / 2 : (result[i - 1].o + result[i - 1].c) / 2;
    result.push({
      t: k.t,
      o,
      c,
      h: Math.max(k.h, o, c),
      l: Math.min(k.l, o, c),
      v: k.v,
    });
  });
  return result;
}

/** The candles a chart type draws: the real ones, or the Heikin Ashi ones. */
export function seriesFor(type: ChartType, candles: Candle[]): Candle[] {
  return type === 'heikin' ? heikinAshi(candles) : candles;
}

/** The types that draw a single line of closes instead of a candle or a bar. */
export const isLineType = (type: ChartType): boolean =>
  type === 'line' || type === 'area' || type === 'baseline';
