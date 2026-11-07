/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  CHART_TYPES,
  INDICATOR_IDS,
  INTERVALS,
  type ChartType,
  type Interval,
  type IndicatorMode,
  type Indicators,
} from '@/skins/trade/chart/chart-types';

/** The only things of the chart the browser keeps: small preferences. The drawings stay in memory. */
export const PREFS_KEY = 'bach-cv-trade-chart';

export interface ChartPrefs {
  type: ChartType;
  /** the size of a candle */
  interval: Interval;
  indicators: Indicators;
  magnet: boolean;
}

export const DEFAULT_PREFS: ChartPrefs = {
  type: 'candles',
  interval: 'month',
  indicators: {
    volume: 'shown',
    ma20: 'shown',
    ma50: 'off',
    ma100: 'off',
    ma200: 'off',
    ema20: 'off',
    ema50: 'shown',
    ema100: 'off',
    ema200: 'off',
    bollinger: 'off',
    rsi: 'off',
    macd: 'off',
  },
  magnet: false,
};

const MODES: readonly IndicatorMode[] = ['off', 'shown', 'hidden'];

/** Reads stored text into preferences: a field that is missing or not understood keeps its default. */
export function parsePrefs(raw: string | null): ChartPrefs {
  if (!raw) return DEFAULT_PREFS;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return DEFAULT_PREFS;
  }
  if (typeof data !== 'object' || data === null) return DEFAULT_PREFS;
  const record = data as Record<string, unknown>;
  const saved =
    typeof record.indicators === 'object' && record.indicators !== null
      ? (record.indicators as Record<string, unknown>)
      : {};
  const indicators = { ...DEFAULT_PREFS.indicators };
  for (const id of INDICATOR_IDS) {
    const mode = saved[id];
    if (MODES.includes(mode as IndicatorMode))
      indicators[id] = mode as IndicatorMode;
  }
  return {
    type: CHART_TYPES.includes(record.type as ChartType)
      ? (record.type as ChartType)
      : DEFAULT_PREFS.type,
    interval: INTERVALS.includes(record.interval as Interval)
      ? (record.interval as Interval)
      : DEFAULT_PREFS.interval,
    indicators,
    magnet: record.magnet === true,
  };
}

export function loadPrefs(): ChartPrefs {
  try {
    return parsePrefs(window.localStorage.getItem(PREFS_KEY));
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: ChartPrefs): void {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // storage can be blocked: the preferences just last for this visit
  }
}
