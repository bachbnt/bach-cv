/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

export const CHART_TYPES = [
  'candles',
  'hollow',
  'bars',
  'heikin',
  'line',
  'area',
  'baseline',
] as const;
/** The id of the hint line that describes the chart to assistive technology. */
export const CHART_HINT_ID = 'tv-chart-hint';

export type ChartType = (typeof CHART_TYPES)[number];

export const isChartType = (value: unknown): value is ChartType =>
  CHART_TYPES.some((type) => type === value);

// The size of a candle: a week (what the career is built from), a calendar month, quarter or year. Defined with the series.
export { INTERVALS, type Interval } from '@/lib/derive/career-series';

export const INDICATOR_IDS = [
  'volume',
  'ma20',
  'ma50',
  'ma100',
  'ma200',
  'ema20',
  'ema50',
  'ema100',
  'ema200',
  'bollinger',
  'rsi',
  'macd',
] as const;
export type IndicatorId = (typeof INDICATOR_IDS)[number];

/** The colour of a line or a value, a word of the skin's palette (`legend.tsx` and `overlay-layer.tsx` turn it into classes). */
export type Tone =
  | 'up'
  | 'down'
  | 'gold'
  | 'sky'
  | 'violet'
  | 'accent'
  | 'orange'
  | 'lime'
  | 'pink'
  | 'teal'
  | 'slate';

/** `shown` is on the chart, `hidden` is kept in the legend but not drawn, `off` is not there. */
export type IndicatorMode = 'off' | 'shown' | 'hidden';

export type ToolId =
  | 'cursor'
  | 'trend'
  | 'ray'
  | 'hline'
  | 'vline'
  | 'rect'
  | 'fib'
  | 'text'
  | 'measure'
  | 'eraser';

export type CursorMode = 'cross' | 'dot' | 'arrow';

export type Indicators = Record<IndicatorId, IndicatorMode>;
