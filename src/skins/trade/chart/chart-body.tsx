/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  markersOn,
  type Candle,
  type CareerEntry,
  type CareerMarker,
} from '@/lib/derive/career-series';
import { chartStore, useChartStore } from '@/skins/trade/chart/chart-store';
import type { Study } from '@/skins/trade/chart/education';
import { barsOf, rangeBars } from '@/skins/trade/chart/intervals';
import { ChartScene } from '@/skins/trade/chart/chart-scene';
import { makeAxis } from '@/skins/trade/chart/time-axis';
import { useChartController } from '@/skins/trade/chart/use-chart-controller';
import { useChartView } from '@/skins/trade/chart/use-chart-view';
import { useReplayClock } from '@/skins/trade/chart/use-replay-clock';
import {
  activeRange,
  limitsOf,
  rangeView,
  retargetView,
} from '@/skins/trade/chart/view';
import { weeksOf, type RangeKey } from '@/skins/trade/config';
import { useReducedMotion } from '@/skins/trade/shell/use-reduced-motion';

/** What stays the same while the chart is on screen: the window (zoom and pan), the replay clock and the link to the buttons outside. */
export function ChartBody({
  candles: weekly,
  markers: weeklyMarkers,
  entries,
  studies,
  width,
  height,
  initialRange,
  onOpenJob,
  onOpenDegree,
}: {
  candles: Candle[];
  markers: CareerMarker[];
  entries: CareerEntry[];
  studies: Study[];
  width: number;
  height: number;
  initialRange: RangeKey;
  onOpenJob: (id: string) => void;
  onOpenDegree: () => void;
}) {
  const reduced = useReducedMotion();
  // the interval the visitor asked for, and the one on screen: they differ only until the window has been moved to the new bars
  const wanted = useChartStore((s) => s.interval);
  const [interval, showInterval] = useState(wanted);
  const bars = barsOf(weekly, interval);
  const count = bars.candles.length;
  const limits = useMemo(() => limitsOf(count, interval), [count, interval]);
  const axis = useMemo(
    () => makeAxis(bars.candles, interval),
    [bars, interval],
  );
  const markers = useMemo(
    () => markersOn(weeklyMarkers, bars),
    [weeklyMarkers, bars],
  );
  const asked = useRef<RangeKey | null>(null);
  const { view, controls } = useChartView(
    limits,
    (l) => rangeView(l, rangeBars(weeksOf(initialRange), interval)),
    reduced,
  );
  const replay = useChartStore((s) => s.replay);
  const bounds = useMemo(
    () => ({ first: weekly[0].t, last: weekly[weekly.length - 1].t }),
    [weekly],
  );

  // New bars (another interval, or the same interval of a series that starts earlier or runs longer): the window is kept on the same
  // stretch of time, never on the same bar numbers, so a zoom or a pan is not undone ("All" stays "All"), and a replay goes on from the
  // same date
  if (wanted !== interval) showInterval(wanted);
  const before = useRef({ interval, bars, axis, limits });
  useLayoutEffect(() => {
    const old = before.current;
    before.current = { interval, bars, axis, limits };
    if (old.bars === bars) return;
    chartStore.publishData(count, bounds);
    const current = controls.ref.current;
    if (current) {
      const all =
        activeRange(current, old.limits, old.interval, asked.current) === 'all';
      controls.set(
        all
          ? rangeView(limits, null)
          : retargetView(current, old.axis, axis, limits),
      );
    }
    const state = chartStore.get().replay;
    if (state.phase === 'ready')
      chartStore.moveReplay(
        Math.max(0, Math.round(axis.index(old.bars.ends[state.at]))),
      );
  }, [interval, bars, axis, limits, count, bounds, controls]);

  useChartController({
    controls,
    view,
    weekly,
    bars,
    limits,
    interval,
    bounds,
    asked,
  });
  useReplayClock(replay, reduced, controls, limits);

  if (!view) return null;
  return (
    <ChartScene
      bars={bars}
      axis={axis}
      limits={limits}
      interval={interval}
      markers={markers}
      entries={entries}
      studies={studies}
      width={width}
      height={height}
      view={view}
      chartView={controls}
      onOpenJob={onOpenJob}
      onOpenDegree={onOpenDegree}
    />
  );
}
