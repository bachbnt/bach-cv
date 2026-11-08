/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type {
  IndicatorId,
  Indicators,
  Tone,
} from '@/skins/trade/chart/chart-types';

/** A value of an indicator, or `null` while it has too little history to be defined. */
export type Series = (number | null)[];

/** The simple moving average of `period` values. */
export function sma(values: number[], period: number): Series {
  let sum = 0;
  return values.map((v, i) => {
    sum += v;
    if (i >= period) sum -= values[i - period];
    return i >= period - 1 ? sum / period : null;
  });
}

/** The exponential moving average, started from the simple average of the first `period` values (as a chart terminal does). */
export function ema(values: number[], period: number): Series {
  const k = 2 / (period + 1);
  const out: Series = [];
  let previous: number | null = null;
  let sum = 0;
  values.forEach((v, i) => {
    if (i < period - 1) {
      sum += v;
      out.push(null);
    } else if (i === period - 1) {
      sum += v;
      previous = sum / period;
      out.push(previous);
    } else {
      previous = v * k + (previous as number) * (1 - k);
      out.push(previous);
    }
  });
  return out;
}

interface BollingerBands {
  mid: Series;
  upper: Series;
  lower: Series;
}

/** Bollinger Bands: the simple average and `mult` standard deviations (of the whole window) on both sides. */
export function bollinger(
  values: number[],
  period = 20,
  mult = 2,
): BollingerBands {
  const mid = sma(values, period);
  const upper: Series = [];
  const lower: Series = [];
  mid.forEach((m, i) => {
    if (m === null) {
      upper.push(null);
      lower.push(null);
      return;
    }
    let squares = 0;
    for (let j = i - period + 1; j <= i; j++) squares += (values[j] - m) ** 2;
    const deviation = Math.sqrt(squares / period);
    upper.push(m + mult * deviation);
    lower.push(m - mult * deviation);
  });
  return { mid, upper, lower };
}

/** The Relative Strength Index with Wilder's smoothing: 0 to 100, 50 when nothing moved. */
export function rsi(values: number[], period = 14): Series {
  const out: Series = values.map(() => null);
  if (values.length <= period) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1];
    if (change > 0) gain += change;
    else loss -= change;
  }
  gain /= period;
  loss /= period;
  const index = (): number =>
    gain + loss === 0 ? 50 : 100 - 100 / (1 + gain / loss);
  out[period] = index();
  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    gain = (gain * (period - 1) + Math.max(change, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-change, 0)) / period;
    out[i] = index();
  }
  return out;
}

interface Macd {
  macd: Series;
  signal: Series;
  histogram: Series;
}

/** MACD: the fast average minus the slow one, its signal line (an average of itself) and the difference of the two. */
export function macd(
  values: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): Macd {
  const quick = ema(values, fast);
  const slowly = ema(values, slow);
  const line: Series = values.map((_, i) => {
    const a = quick[i];
    const b = slowly[i];
    return a === null || b === null ? null : a - b;
  });
  const first = line.findIndex((v) => v !== null);
  const signal: Series = line.map(() => null);
  if (first >= 0) {
    const tail = ema(line.slice(first) as number[], signalPeriod);
    tail.forEach((v, i) => {
      signal[first + i] = v;
    });
  }
  const histogram: Series = line.map((v, i) => {
    const s = signal[i];
    return v === null || s === null ? null : v - s;
  });
  return { macd: line, signal, histogram };
}

/** The lowest and highest defined value of the lists, or `null` when there is none. */
export function extent(
  lists: Series[],
  from: number,
  to: number,
): [number, number] | null {
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  for (const list of lists)
    for (let i = Math.max(0, from); i < Math.min(list.length, to); i++) {
      const v = list[i];
      if (v === null) continue;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  return lo <= hi ? [lo, hi] : null;
}

/** The moving averages drawn over the candles: one line for each, all made from this list (no code of its own for a period). */
interface OverlaySpec {
  id: IndicatorId;
  kind: 'ma' | 'ema';
  period: number;
  tone: Tone;
}

export const OVERLAYS = [
  { id: 'ma20', kind: 'ma', period: 20, tone: 'gold' },
  { id: 'ma50', kind: 'ma', period: 50, tone: 'sky' },
  { id: 'ma100', kind: 'ma', period: 100, tone: 'violet' },
  { id: 'ma200', kind: 'ma', period: 200, tone: 'orange' },
  { id: 'ema20', kind: 'ema', period: 20, tone: 'lime' },
  { id: 'ema50', kind: 'ema', period: 50, tone: 'pink' },
  { id: 'ema100', kind: 'ema', period: 100, tone: 'teal' },
  { id: 'ema200', kind: 'ema', period: 200, tone: 'slate' },
] as const satisfies readonly OverlaySpec[];

type OverlayId = (typeof OVERLAYS)[number]['id'];

/** How the Indicators window groups them, and how many bars each needs before it has a value. */
export type IndicatorGroup = 'moving' | 'volatility' | 'oscillators' | 'volume';

interface IndicatorInfo {
  group: IndicatorGroup;
  /** the bars it needs before its first value */
  needs: number;
}

export const INDICATOR_INFO: Record<IndicatorId, IndicatorInfo> = {
  volume: { group: 'volume', needs: 0 },
  ...(Object.fromEntries(
    OVERLAYS.map((o) => [o.id, { group: 'moving', needs: o.period }]),
  ) as Record<OverlayId, IndicatorInfo>),
  bollinger: { group: 'volatility', needs: 20 },
  rsi: { group: 'oscillators', needs: 15 },
  macd: { group: 'oscillators', needs: 34 },
};

export interface IndicatorData {
  /** the line of each moving average */
  lines: Record<OverlayId, Series>;
  bollinger: BollingerBands;
  rsi: Series;
  macd: Macd;
  /** the average of the volume of 20 bars, drawn over the volume histogram */
  volumeMa: Series;
}

/** Every indicator of the chart for a list of closes (and volumes), computed in one go (it is cheap: the chart has a few hundred bars). */
export function computeIndicators(
  closes: number[],
  volumes: number[] = [],
): IndicatorData {
  return {
    lines: Object.fromEntries(
      OVERLAYS.map((o) => [
        o.id,
        o.kind === 'ma' ? sma(closes, o.period) : ema(closes, o.period),
      ]),
    ) as Record<OverlayId, Series>,
    bollinger: bollinger(closes, 20, 2),
    rsi: rsi(closes, 14),
    macd: macd(closes, 12, 26, 9),
    volumeMa: sma(volumes, 20),
  };
}

const defined = (list: Series): boolean => list.some((v) => v !== null);

/**
 * The indicators that are on and have at least one value: on a yearly chart of a few bars a 20 bar average has none, so it is not drawn
 * and not listed (the visitor's choice is kept, it appears again on an interval with enough bars). The same object comes back when
 * nothing changed.
 */
export function availableIndicators(
  indicators: Indicators,
  data: IndicatorData,
): Indicators {
  const ready: Record<IndicatorId, boolean> = {
    volume: true,
    ...(Object.fromEntries(
      OVERLAYS.map((o) => [o.id, defined(data.lines[o.id])]),
    ) as Record<OverlayId, boolean>),
    bollinger: defined(data.bollinger.mid),
    rsi: defined(data.rsi),
    macd: defined(data.macd.histogram),
  };
  const ids = Object.keys(ready) as IndicatorId[];
  if (ids.every((id) => ready[id] || indicators[id] === 'off'))
    return indicators;
  const next = { ...indicators };
  for (const id of ids) if (!ready[id]) next[id] = 'off';
  return next;
}
