/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import type { Candle } from '@/lib/derive/career-series';
import type { Frame } from '@/skins/trade/chart/frame';

/** The dotted line at the last close, breathing. It belongs in the clipped plot; its tag is `LastPriceTag`, on the price scale. */
export const LastPriceLine = memo(function LastPriceLine({
  candle,
  frame,
}: {
  candle: Candle;
  frame: Frame;
}) {
  const { price, layout } = frame;
  const y = price.y(candle.c);
  if (y < layout.main.top || y > layout.main.bottom) return null;
  return (
    <line
      x1={0}
      x2={layout.plotWidth}
      y1={y}
      y2={y}
      strokeDasharray='1 3'
      data-last-price=''
      className={`tv-chart-pulse ${candle.c >= candle.o ? 'stroke-tv-up' : 'stroke-tv-down'}`}
    />
  );
});
