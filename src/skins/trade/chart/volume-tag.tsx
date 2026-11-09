/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import type { Candle } from '@/lib/derive/career-series';
import type { Frame } from '@/skins/trade/chart/frame';
import { formatVolume, volumeScale } from '@/skins/trade/chart/volume';

/** The label of the last volume on the right scale, at the top of its bar, in the colour of the candle (as a chart terminal marks it). */
export const VolumeTag = memo(function VolumeTag({
  candles,
  frame,
}: {
  candles: Candle[];
  frame: Frame;
}) {
  const { start, end, layout } = frame;
  const last = candles[end - 1];
  if (!last) return null;
  const base = layout.main.bottom - 2;
  const top = volumeScale(candles, start, end, base, layout.volume).y(last.v);
  const y = Math.min(base - 7, Math.max(layout.main.top + 7, top));
  return (
    <g data-testid='tv-volume-tag' className='pointer-events-none'>
      <rect
        x={layout.plotWidth + 1}
        y={y - 7}
        width={layout.padRight - 2}
        height={14}
        rx={2}
        className={last.c >= last.o ? 'fill-tv-up' : 'fill-tv-down'}
      />
      <text
        x={layout.plotWidth + layout.padRight / 2}
        y={y + 3.5}
        textAnchor='middle'
        className='fill-white text-[10px] font-semibold tabular-nums'
      >
        {formatVolume(last.v)}
      </text>
    </g>
  );
});
