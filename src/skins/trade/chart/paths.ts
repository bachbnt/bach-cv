/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Candle } from '@/lib/derive/career-series';
import type { Series } from '@/skins/trade/chart/indicators';

/** The two functions every path needs: a bar index to x and a price to y, and the width of a candle body. */
interface Projector {
  x: (index: number) => number;
  y: (price: number) => number;
  body: number;
}

/** Pixel coordinates are written with one decimal: a path of 350 candles stays short. */
const n = (value: number): string => String(Math.round(value * 10) / 10);

interface CandlePaths {
  upWick: string;
  downWick: string;
  upBody: string;
  downBody: string;
}

/**
 * Every candle of the window as a few paths instead of a few nodes each: the wicks and the bodies, one pair for the rising weeks and
 * one for the falling ones. `first` is the bar index of `items[0]`.
 */
export function candlePaths(
  items: Candle[],
  first: number,
  p: Projector,
): CandlePaths {
  const out = { upWick: '', downWick: '', upBody: '', downBody: '' };
  items.forEach((k, j) => {
    const x = p.x(first + j);
    const up = k.c >= k.o;
    const top = p.y(Math.max(k.o, k.c));
    const height = Math.max(1, Math.abs(p.y(k.o) - p.y(k.c)));
    const wick = `M${n(x)} ${n(p.y(k.h))}V${n(p.y(k.l))}`;
    const body = `M${n(x - p.body / 2)} ${n(top)}h${n(p.body)}v${n(height)}h${n(-p.body)}z`;
    if (up) {
      out.upWick += wick;
      out.upBody += body;
    } else {
      out.downWick += wick;
      out.downBody += body;
    }
  });
  return out;
}

interface BarPaths {
  up: string;
  down: string;
}

/** OHLC bars: a stem from the high to the low, a tick to the left at the open and one to the right at the close. */
export function barPaths(
  items: Candle[],
  first: number,
  p: Projector,
): BarPaths {
  const out = { up: '', down: '' };
  const tick = Math.max(2, p.body / 2);
  items.forEach((k, j) => {
    const x = p.x(first + j);
    const bar = `M${n(x)} ${n(p.y(k.h))}V${n(p.y(k.l))}M${n(x - tick)} ${n(p.y(k.o))}H${n(x)}M${n(x)} ${n(p.y(k.c))}H${n(x + tick)}`;
    if (k.c >= k.o) out.up += bar;
    else out.down += bar;
  });
  return out;
}

/** The volume bars, standing on `floor`, `height` tall for the biggest one of the window. */
export function volumePaths(
  items: Candle[],
  first: number,
  p: Pick<Projector, 'x' | 'body'>,
  floor: number,
  height: number,
): BarPaths {
  const out = { up: '', down: '' };
  const biggest = Math.max(1, ...items.map((k) => k.v));
  items.forEach((k, j) => {
    const h = (k.v / biggest) * height;
    const bar = `M${n(p.x(first + j) - p.body / 2)} ${n(floor)}v${n(-h)}h${n(p.body)}v${n(h)}z`;
    if (k.c >= k.o) out.up += bar;
    else out.down += bar;
  });
  return out;
}

/** A line through the values that are defined (a gap where one is `null`, so an average starts where it has data). */
export function linePath(
  values: Series,
  start: number,
  end: number,
  p: Pick<Projector, 'x' | 'y'>,
): string {
  let d = '';
  let pen = false;
  for (let i = start; i < end; i++) {
    const v = values[i];
    if (v === null || v === undefined) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${n(p.x(i))} ${n(p.y(v))}`;
    pen = true;
  }
  return d;
}

/** The closes of the candles as a line. */
export function closeLine(
  items: Candle[],
  first: number,
  p: Pick<Projector, 'x' | 'y'>,
): string {
  return items
    .map((k, j) => `${j === 0 ? 'M' : 'L'}${n(p.x(first + j))} ${n(p.y(k.c))}`)
    .join('');
}

/** The line closed down to `floor`: the area under it. */
export function areaPath(
  items: Candle[],
  first: number,
  p: Pick<Projector, 'x' | 'y'>,
  floor: number,
): string {
  if (items.length === 0) return '';
  return `${closeLine(items, first, p)}L${n(p.x(first + items.length - 1))} ${n(floor)}L${n(p.x(first))} ${n(floor)}Z`;
}

/** The area between two lines (the Bollinger band). */
export function bandPath(
  upper: Series,
  lower: Series,
  start: number,
  end: number,
  p: Pick<Projector, 'x' | 'y'>,
): string {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = start; i < end; i++) {
    const u = upper[i];
    const l = lower[i];
    if (u === null || u === undefined || l === null || l === undefined)
      continue;
    top.push(`${n(p.x(i))} ${n(p.y(u))}`);
    bottom.push(`${n(p.x(i))} ${n(p.y(l))}`);
  }
  if (top.length === 0) return '';
  return `M${top.join('L')}L${bottom.reverse().join('L')}Z`;
}

/** The bars of the MACD histogram from the zero line, split by sign. */
export function histogramPaths(
  values: Series,
  start: number,
  end: number,
  p: Pick<Projector, 'x' | 'y' | 'body'>,
): BarPaths {
  const out = { up: '', down: '' };
  const zero = p.y(0);
  for (let i = start; i < end; i++) {
    const v = values[i];
    if (v === null || v === undefined) continue;
    const y = p.y(v);
    const bar = `M${n(p.x(i) - p.body / 2)} ${n(zero)}V${n(y)}h${n(p.body)}V${n(zero)}z`;
    if (v >= 0) out.up += bar;
    else out.down += bar;
  }
  return out;
}
