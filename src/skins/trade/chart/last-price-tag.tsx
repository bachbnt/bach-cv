/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo, useState } from 'react';
import type { Candle } from '@/lib/derive/career-series';
import { cn } from '@/lib/utils';
import type { Frame } from '@/skins/trade/chart/frame';
import { AxisTag } from '@/skins/trade/chart/axis-tag';

/**
 * The tag of the last close on the price scale, with the word under it. It flashes every time the last candle ticks (`tick` is its
 * key, so the flash starts again).
 */
export const LastPriceTag = memo(function LastPriceTag({
  candle,
  frame,
  label,
  tick,
}: {
  candle: Candle;
  frame: Frame;
  label: string;
  tick: number;
}) {
  // which way the last close moved since the previous tick: the flash is tinted with it
  const [last, setLast] = useState({ close: candle.c, up: true });
  if (candle.c !== last.close)
    setLast({ close: candle.c, up: candle.c > last.close });
  const { price, layout } = frame;
  const y = price.y(candle.c);
  if (y < layout.main.top || y > layout.main.bottom) return null;
  // the solid colours carry the white text of the tag (the bright ones are too pale under it)
  const tone =
    candle.c >= candle.o
      ? 'fill-tv-up-solid stroke-tv-up-solid'
      : 'fill-tv-down-solid stroke-tv-down-solid';
  return (
    <g className={`text-[11px] tabular-nums ${tone}`}>
      {tick > 0 && (
        <rect
          key={`halo-${tick}`}
          x={layout.plotWidth - 3}
          y={y - 12}
          width={layout.padRight + 3}
          height={24}
          rx={3}
          stroke='none'
          className={cn(
            'tv-chart-halo',
            last.up ? 'fill-tv-up' : 'fill-tv-down',
          )}
        />
      )}
      <g key={tick} className='tv-chart-flash'>
        <AxisTag
          frame={frame}
          y={y}
          text={candle.c.toFixed(2)}
          className={tone}
        />
      </g>
      <rect
        x={layout.plotWidth}
        y={y + 9}
        width={layout.padRight}
        height={16}
        opacity={0.8}
        stroke='none'
      />
      <text
        x={layout.plotWidth + 6}
        y={y + 21}
        fontSize={10}
        className='fill-white'
        stroke='none'
      >
        {label}
      </text>
    </g>
  );
});
