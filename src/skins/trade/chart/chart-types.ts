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
export type ChartType = (typeof CHART_TYPES)[number];

/** The size of a candle: a week (what the career is built from), a calendar month, quarter or year. */
export const INTERVALS = ['week', 'month', 'quarter', 'year'] as const;
export type Interval = (typeof INTERVALS)[number];

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

export const TOOL_IDS = [
  'cursor',
  'trend',
  'ray',
  'hline',
  'vline',
  'rect',
  'fib',
  'text',
  'measure',
  'eraser',
] as const;
export type ToolId = (typeof TOOL_IDS)[number];

export const CURSOR_MODES = ['cross', 'dot', 'arrow'] as const;
export type CursorMode = (typeof CURSOR_MODES)[number];

export type Indicators = Record<IndicatorId, IndicatorMode>;
