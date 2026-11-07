/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';

/** Each candle: [open, close, low, high] in drawing units (a smaller number is higher). */
const CANDLES = [
  [60, 48, 66, 42],
  [48, 52, 58, 40],
  [52, 38, 56, 34],
  [38, 30, 42, 24],
  [30, 36, 42, 26],
  [36, 24, 40, 20],
  [24, 16, 28, 12],
  [16, 20, 24, 8],
] as const;

const X = (i: number) => 16 + i * 26;
const LAST = CANDLES.length - 1;

/**
 * A few candles that draw themselves, for the system screens. `missing` (404) leaves the last candle as a dashed outline, `closed` (maintenance)
 * turns the candles grey and ends on a flat line, `ghost` (coming soon) only outlines them and lets them pulse. Pure decoration, hidden from
 * assistive technology; the shapes are made up and say nothing about the career.
 */
export function TvCandleArt({
  variant,
  className,
}: {
  variant: 'missing' | 'closed' | 'ghost';
  className?: string;
}) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 224 80'
      className={cn('overflow-visible', className)}
    >
      <line
        x1='0'
        x2='224'
        y1='79.5'
        y2='79.5'
        className='stroke-tv-line'
        strokeWidth='1'
      />
      {variant === 'closed' && (
        <line
          x1='0'
          x2='224'
          y1='20'
          y2='20'
          className='animate-[tv-fade-in_0.6s_ease-out_1.2s_both] stroke-tv-dim'
          strokeWidth='1'
          strokeDasharray='4 4'
        />
      )}
      {CANDLES.map(([open, close, low, high], i) => {
        if (variant === 'missing' && i === LAST) return null;
        const up = close < open;
        const doji = variant === 'closed' && i === LAST;
        const tone =
          variant === 'closed'
            ? 'stroke-tv-dim fill-tv-dim'
            : variant === 'ghost'
              ? 'stroke-tv-dim fill-transparent'
              : up
                ? 'stroke-tv-up fill-tv-up'
                : 'stroke-tv-down fill-tv-down';
        return (
          <g
            key={i}
            style={{ animationDelay: `${i * 110}ms` }}
            className={cn(
              '[transform-box:fill-box] origin-bottom',
              variant === 'ghost'
                ? 'animate-[tv-pulse_2.4s_ease-in-out_infinite]'
                : 'animate-[tv-candle-draw_0.5s_cubic-bezier(0.2,0.7,0.2,1)_both]',
              tone,
            )}
          >
            <line x1={X(i)} x2={X(i)} y1={low} y2={high} strokeWidth='1.5' />
            <rect
              x={X(i) - 6}
              y={doji ? 19 : Math.min(open, close)}
              width='12'
              height={doji ? 2 : Math.max(2, Math.abs(open - close))}
              rx='1'
              strokeWidth={variant === 'ghost' ? 1.2 : 0}
              strokeDasharray={variant === 'ghost' ? '3 2' : undefined}
            />
          </g>
        );
      })}
      {variant === 'missing' && (
        <g className='animate-[tv-pulse_1.8s_ease-in-out_1s_infinite]'>
          <rect
            x={X(LAST) - 6}
            y='8'
            width='12'
            height='40'
            rx='1'
            fill='none'
            strokeWidth='1.2'
            strokeDasharray='3 3'
            className='stroke-tv-mute'
          />
          <text
            x={X(LAST)}
            y='33'
            textAnchor='middle'
            fontSize='11'
            className='fill-tv-mute font-bold'
          >
            ?
          </text>
        </g>
      )}
    </svg>
  );
}
