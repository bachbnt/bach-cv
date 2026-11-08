/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { TvArtCandles, type ArtCandle } from '@/skins/trade/ui/tv-art-candles';

const CANDLES: ArtCandle[] = [
  [90, 84, 94, 80],
  [84, 87, 90, 81],
  [87, 76, 90, 74],
  [76, 79, 83, 72],
  [79, 68, 81, 66],
  [68, 60, 70, 57],
  [60, 63, 66, 56],
  [63, 50, 65, 47],
  [50, 42, 52, 39],
];
/** The numbered steps of the lesson, on the trend line. */
const STEPS = [
  [44, 62],
  [90, 49],
  [136, 32],
] as const;

/** Teaching: a lesson as an annotated chart: a trend line drawn with two handles and a parallel channel, numbered steps on it, and the progress of the lesson below. */
export function TvArtTeaching() {
  return (
    <>
      <rect
        x='6'
        y='8'
        width='164'
        height='96'
        rx='5'
        className='fill-tv-panel stroke-tv-line'
      />
      <path
        d='M12 36 H164 M12 60 H164 M12 84 H164'
        fill='none'
        strokeDasharray='2 3'
        className='stroke-tv-line'
      />
      <TvArtCandles candles={CANDLES} x={22} step={15.5} width={6} blinkLast />
      <path
        d='M24 96 L150 28'
        pathLength='1'
        fill='none'
        strokeWidth='1.6'
        strokeLinecap='round'
        className='animate-[tv-art-draw_1.4s_ease-out_both] stroke-tv-accent [stroke-dasharray:1]'
      />
      <path
        d='M24 80 L150 12'
        fill='none'
        strokeWidth='1'
        strokeDasharray='4 3'
        className='stroke-tv-accent/55'
      />
      {[
        [24, 96],
        [150, 28],
      ].map(([x, y]) => (
        <circle
          key={x}
          cx={x}
          cy={y}
          r='3.2'
          strokeWidth='1.5'
          className='fill-tv-panel stroke-tv-accent'
        />
      ))}
      {STEPS.map(([x, y], i) => (
        <g
          key={i}
          style={{ animationDelay: `${600 + i * 250}ms` }}
          className='animate-[tv-fade-in_0.5s_ease-out_both]'
        >
          <circle cx={x} cy={y} r='6.5' className='fill-tv-gold' />
          <text
            x={x}
            y={y}
            dy='0.35em'
            textAnchor='middle'
            fontSize='8'
            fontWeight='700'
            className='fill-tv-night'
          >
            {i + 1}
          </text>
        </g>
      ))}
      <rect
        x='6'
        y='112'
        width='164'
        height='6'
        rx='3'
        className='fill-tv-hover'
      />
      <rect
        x='6'
        y='112'
        width='54'
        height='6'
        rx='3'
        className='origin-left animate-[tv-art-grow_1.2s_var(--ease-tv-out)_both] fill-tv-accent [transform-box:fill-box]'
      />
    </>
  );
}
