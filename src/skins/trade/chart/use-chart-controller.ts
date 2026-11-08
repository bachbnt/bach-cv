/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, type RefObject } from 'react';
import type { Bars, Candle } from '@/lib/derive/career-series';
import { weeksOf, type RangeKey } from '@/skins/trade/config';
import { chartStore } from '@/skins/trade/chart/chart-store';
import type { Interval } from '@/skins/trade/chart/chart-types';
import { barAtTime, barsOf, rangeBars } from '@/skins/trade/chart/intervals';
import type { ChartView } from '@/skins/trade/chart/use-chart-view';
import {
  activeRange,
  centerView,
  rangeView,
  zoomView,
  type Limits,
  type View,
} from '@/skins/trade/chart/view';

/**
 * The link between the chart and the buttons outside it (range bar, tool rail): hands the store a controller that steers the window,
 * and tells the store what the chart has (its bars, its bounds, the bars of each interval, the range the window is on).
 */
export function useChartController({
  controls,
  view,
  weekly,
  bars,
  limits,
  interval,
  bounds,
  asked,
}: {
  controls: ChartView;
  view: View | null;
  weekly: Candle[];
  bars: Bars;
  limits: Limits;
  interval: Interval;
  bounds: { first: number; last: number };
  /** the range button pressed last, which tells "All" from a window that merely spans every bar */
  asked: RefObject<RangeKey | null>;
}) {
  const count = bars.candles.length;

  useEffect(() => {
    const go = (target: View) => controls.animate(target);
    const current = () => controls.ref.current;
    chartStore.setController({
      setRange: (key) => {
        asked.current = key;
        chartStore.setAuto(true);
        go(rangeView(limits, rangeBars(weeksOf(key), interval)));
      },
      goTo: (year, month) => {
        const found = barAtTime(bars, new Date(year, month, 1).getTime());
        const now = current();
        if (now) go(centerView(now, found, limits));
      },
      fit: () => {
        chartStore.setAuto(true);
        go(rangeView(limits, null));
      },
      zoom: (factor) => {
        const now = current();
        if (now) go(zoomView(now, factor, 0.5, limits));
      },
    });
    return () => chartStore.setController(null);
  }, [controls, bars, limits, interval, asked]);

  useEffect(() => {
    chartStore.publishData(count, bounds);
    chartStore.publishIntervalBars({
      week: barsOf(weekly, 'week').candles.length,
      month: barsOf(weekly, 'month').candles.length,
      quarter: barsOf(weekly, 'quarter').candles.length,
      year: barsOf(weekly, 'year').candles.length,
    });
  }, [bounds, count, weekly]);

  useEffect(() => {
    if (view)
      chartStore.publishRange(
        activeRange(view, limits, interval, asked.current),
      );
  }, [view, limits, interval, asked]);
}
