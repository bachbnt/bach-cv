/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { TvArtCandles, type ArtCandle } from '@/skins/trade/ui/tv-art-candles';

const CANDLES: ArtCandle[] = [
  [86, 80, 90, 76],
  [80, 84, 88, 77],
  [84, 74, 86, 72],
  [74, 78, 82, 70],
  [78, 66, 80, 64],
  [66, 70, 74, 62],
  [70, 58, 72, 56],
  [58, 52, 60, 48],
  [52, 56, 60, 46],
  [56, 44, 58, 42],
];
const VOLUME = [6, 9, 5, 8, 11, 6, 10, 12, 7, 9];
const ASKS = [20, 30, 38, 26, 44, 18];
const BIDS = [40, 28, 46, 34, 22, 30];

/** The web app: a dashboard panel with a tab bar, a candle chart with a moving average and volume, and an order book of depth bars. */
export function TvArtWeb() {
  return (
    <>
      <rect
        x='6'
        y='8'
        width='164'
        height='112'
        rx='5'
        className='fill-tv-panel stroke-tv-line'
      />
      <path
        d='M6 22 H170 M106 22 V120'
        fill='none'
        className='stroke-tv-line'
      />
      <rect
        x='12'
        y='12.5'
        width='22'
        height='5'
        rx='2'
        className='fill-tv-accent'
      />
      <rect
        x='38'
        y='12.5'
        width='16'
        height='5'
        rx='2'
        className='fill-tv-line'
      />
      <rect
        x='58'
        y='12.5'
        width='16'
        height='5'
        rx='2'
        className='fill-tv-line'
      />
      <circle
        cx='162'
        cy='15'
        r='2'
        className='animate-[tv-pulse_1.6s_ease-in-out_infinite] fill-tv-up'
      />
      <path
        d='M12 42 H100 M12 62 H100 M12 82 H100'
        fill='none'
        strokeDasharray='2 3'
        className='stroke-tv-line'
      />
      <TvArtCandles candles={CANDLES} x={19} step={8.6} width={4.6} blinkLast />
      <path
        d='M19 84 L36 80 L53 72 L70 66 L88 56 L97 50'
        pathLength='1'
        fill='none'
        strokeWidth='1.4'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='animate-[tv-art-draw_1.4s_ease-out_both] stroke-tv-gold [stroke-dasharray:1]'
      />
      {VOLUME.map((h, i) => (
        <rect
          key={i}
          x={16.5 + i * 8.6}
          y={116 - h}
          width='5'
          height={h}
          rx='0.6'
          className={i > 6 ? 'fill-tv-up/45' : 'fill-tv-dim/45'}
        />
      ))}
      <rect
        x='112'
        y='27'
        width='18'
        height='3'
        rx='1.5'
        className='fill-tv-mute/60'
      />
      {ASKS.map((w, i) => (
        <rect
          key={i}
          x='112'
          y={34 + i * 5.6}
          width={w}
          height='3.6'
          rx='1'
          style={{ animationDelay: `${i * 140}ms` }}
          className='origin-left animate-[tv-art-depth_2.4s_ease-in-out_infinite_alternate] fill-tv-down/55 [transform-box:fill-box]'
        />
      ))}
      <rect
        x='112'
        y='69'
        width='52'
        height='6'
        rx='1.5'
        className='fill-tv-hover'
      />
      <rect
        x='115'
        y='71'
        width='14'
        height='2'
        rx='1'
        className='fill-tv-ink/70'
      />
      {BIDS.map((w, i) => (
        <rect
          key={i}
          x='112'
          y={79 + i * 5.6}
          width={w}
          height='3.6'
          rx='1'
          style={{ animationDelay: `${i * 140 + 500}ms` }}
          className='origin-left animate-[tv-art-depth_2.4s_ease-in-out_infinite_alternate] fill-tv-up/55 [transform-box:fill-box]'
        />
      ))}
    </>
  );
}
