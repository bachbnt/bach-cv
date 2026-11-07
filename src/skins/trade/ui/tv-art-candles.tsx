/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';

/** One candle in drawing units, `[open, close, low, high]`: a smaller number is higher, a close above the open is green. */
export type ArtCandle = readonly [number, number, number, number];

/**
 * A run of candles for the drawings of the services (decoration only, so the numbers mean nothing). `x` is the centre of the first one,
 * `step` the distance between centres. With `blinkLast` the last candle breathes, which reduced motion turns off for the whole skin.
 */
export function TvArtCandles({
  candles,
  x,
  step,
  width,
  blinkLast,
  className,
}: {
  candles: readonly ArtCandle[];
  x: number;
  step: number;
  width: number;
  blinkLast?: boolean;
  className?: string;
}) {
  return (
    <g className={className}>
      {candles.map(([open, close, low, high], i) => {
        const cx = x + i * step;
        const up = close < open;
        return (
          <g
            key={i}
            className={cn(
              up ? 'fill-tv-up stroke-tv-up' : 'fill-tv-down stroke-tv-down',
              blinkLast &&
                i === candles.length - 1 &&
                'animate-[tv-pulse_1.6s_ease-in-out_infinite]',
            )}
          >
            <line x1={cx} x2={cx} y1={low} y2={high} strokeWidth='1.2' />
            <rect
              x={cx - width / 2}
              y={Math.min(open, close)}
              width={width}
              height={Math.max(1.5, Math.abs(open - close))}
              rx='0.8'
              strokeWidth='0'
            />
          </g>
        );
      })}
    </g>
  );
}
