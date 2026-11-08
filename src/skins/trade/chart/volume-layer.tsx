/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import type { Candle } from '@/lib/derive/career-series';
import type { Frame } from '@/skins/trade/chart/frame';
import type { Series } from '@/skins/trade/chart/indicators';
import { linePath, volumePaths } from '@/skins/trade/chart/paths';
import { volumeBarWidth, volumeScale } from '@/skins/trade/chart/volume';

/**
 * The volume histogram at the bottom of the price pane (a quarter of its height at most, the biggest bar on screen reaching it): the
 * bars of rising candles in the up colour and of falling ones in the down colour, a thin gap between them, the bar under the crosshair
 * brighter, and the average of 20 bars as a thin line. The bars are two paths, whatever their number.
 */
export const VolumeLayer = memo(function VolumeLayer({
  candles,
  frame,
  average,
  highlight,
}: {
  /** the real candles (the volume of a Heikin Ashi candle is the one of its week) */
  candles: Candle[];
  frame: Frame;
  /** the average of the volume (it is drawn when it has values) */
  average: Series | null;
  /** the bar under the crosshair, or `null` */
  highlight: number | null;
}) {
  const { start, end, ts, layout } = frame;
  const base = layout.main.bottom - 2;
  const width = volumeBarWidth(ts.slot);
  const scale = volumeScale(candles, start, end, base, layout.volume);
  const bars = volumePaths(
    candles.slice(start, end),
    start,
    { x: ts.x, body: width },
    base,
    layout.volume,
  );
  const line = average
    ? linePath(average, start, end, { x: ts.x, y: scale.y })
    : '';
  const lit =
    highlight !== null && highlight >= start && highlight < end
      ? candles[highlight]
      : null;
  return (
    <g data-indicator='volume' stroke='none'>
      <g opacity={0.5}>
        <path d={bars.up} className='fill-tv-up' />
        <path d={bars.down} className='fill-tv-down' />
      </g>
      {lit && highlight !== null && (
        <rect
          x={ts.x(highlight) - width / 2}
          y={scale.y(lit.v)}
          width={width}
          height={scale.h(lit.v)}
          opacity={0.95}
          className={lit.c >= lit.o ? 'fill-tv-up' : 'fill-tv-down'}
        />
      )}
      {line && (
        <path
          d={line}
          fill='none'
          strokeWidth={1}
          strokeLinejoin='round'
          className='stroke-tv-orange'
        />
      )}
    </g>
  );
});
