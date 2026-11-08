/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Candle } from '@/lib/derive/career-series';
import type { ChartType, Interval } from '@/skins/trade/chart/chart-types';
import type { Frame } from '@/skins/trade/chart/frame';

const TYPE_MS = 240;
/** the old candles fade out this long when the interval changes */
const INTERVAL_MS = 240;

/** What was drawn last: kept so that it can fade out, with its own frame, when the interval changes. */
export interface Drawn {
  type: ChartType;
  shown: Candle[];
  frame: Frame;
  baseline: number;
}

/**
 * The cross fades of the chart. A change of type: the old picture (`leaving`) fades out while the new one fades in. A change of
 * interval: the old candles (`fading`, with the geometry they had) fade out while the new ones fade in, and `onIntervalChange`
 * clears the crosshair, whose bar number means something else now.
 */
export function useChartFade({
  type,
  interval,
  shown,
  frame,
  baseline,
  reduced,
  onIntervalChange,
}: {
  type: ChartType;
  interval: Interval;
  shown: Candle[];
  frame: Frame;
  baseline: number;
  reduced: boolean;
  onIntervalChange: () => void;
}) {
  const [previous, setPrevious] = useState<ChartType>(type);
  const [leaving, setLeaving] = useState<ChartType | null>(null);
  if (type !== previous) {
    setPrevious(type);
    setLeaving(previous);
  }
  useEffect(() => {
    if (leaving === null) return;
    const timer = setTimeout(() => setLeaving(null), TYPE_MS);
    return () => clearTimeout(timer);
  }, [leaving, type]);

  const drawn = useRef<Drawn | null>(null);
  const shownInterval = useRef(interval);
  const [fading, setFading] = useState<Drawn | null>(null);
  useLayoutEffect(() => {
    if (shownInterval.current !== interval) {
      shownInterval.current = interval;
      onIntervalChange();
      if (!reduced && drawn.current) setFading(drawn.current);
    }
    drawn.current = { type, shown, frame, baseline };
  }, [interval, type, shown, frame, baseline, reduced, onIntervalChange]);
  useEffect(() => {
    if (!fading) return;
    const timer = setTimeout(() => setFading(null), INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [fading]);

  return { leaving, fading };
}
