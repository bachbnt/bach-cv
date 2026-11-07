/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { TvArtCandles, type ArtCandle } from '@/skins/trade/ui/tv-art-candles';

const ROW: ArtCandle[] = [
  [86, 80, 90, 76],
  [80, 83, 86, 77],
  [83, 74, 86, 72],
  [74, 77, 80, 70],
  [77, 68, 79, 66],
  [68, 62, 70, 60],
];
const BACK: ArtCandle[] = [
  [98, 92, 102, 88],
  [92, 95, 98, 89],
  [95, 86, 98, 84],
  [86, 80, 88, 78],
  [80, 84, 88, 77],
];

/** The app: a phone wireframe whose screen is a price chart with a sparkline, a row of candles and a watch list, with a card on each side. */
export function TvArtApp() {
  return (
    <>
      <TvArtCandles
        candles={BACK}
        x={16}
        step={9}
        width={5}
        className='opacity-35'
      />
      <g>
        <rect
          x='120'
          y='24'
          width='48'
          height='30'
          rx='4'
          className='fill-tv-panel stroke-tv-line'
        />
        <rect
          x='126'
          y='30'
          width='16'
          height='3'
          rx='1.5'
          className='fill-tv-mute/60'
        />
        <path
          d='M126 48 L133 43 L139 46 L147 38 L154 41 L162 34'
          fill='none'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='stroke-tv-accent'
        />
        <rect
          x='120'
          y='62'
          width='48'
          height='14'
          rx='7'
          className='fill-tv-accent/15'
        />
        <circle cx='129' cy='69' r='3' className='fill-tv-accent' />
        <rect
          x='136'
          y='67.5'
          width='24'
          height='3'
          rx='1.5'
          className='fill-tv-accent/50'
        />
      </g>
      <rect
        x='62'
        y='6'
        width='52'
        height='116'
        rx='10'
        strokeWidth='1.6'
        className='fill-tv-panel stroke-tv-dim'
      />
      <rect
        x='80'
        y='10.5'
        width='16'
        height='3.5'
        rx='1.75'
        className='fill-tv-line'
      />
      <rect
        x='69'
        y='20'
        width='14'
        height='3'
        rx='1.5'
        className='fill-tv-mute/70'
      />
      <circle cx='106' cy='21.5' r='3' className='fill-tv-accent' />
      <rect
        x='69'
        y='27'
        width='24'
        height='5'
        rx='2'
        className='fill-tv-ink/85'
      />
      <path
        d='M69 56 L75 52 L80 54 L86 46 L91 48 L97 41 L102 43 L107 36 L107 62 L69 62 Z'
        className='fill-tv-up/15'
      />
      <path
        d='M69 56 L75 52 L80 54 L86 46 L91 48 L97 41 L102 43 L107 36'
        pathLength='1'
        fill='none'
        strokeWidth='1.6'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='animate-[tv-art-draw_1.4s_ease-out_both] stroke-tv-up [stroke-dasharray:1]'
      />
      <circle
        cx='107'
        cy='36'
        r='2.4'
        className='animate-[tv-pulse_1.6s_ease-in-out_infinite] fill-tv-up'
      />
      <TvArtCandles candles={ROW} x={74} step={6.5} width={3.4} blinkLast />
      <g>
        <circle cx='73' cy='95' r='3' className='fill-tv-violet' />
        <rect
          x='79'
          y='93.5'
          width='15'
          height='3'
          rx='1.5'
          className='fill-tv-mute/60'
        />
        <rect
          x='99'
          y='93.5'
          width='8'
          height='3'
          rx='1.5'
          className='fill-tv-up'
        />
        <circle cx='73' cy='106' r='3' className='fill-tv-sky' />
        <rect
          x='79'
          y='104.5'
          width='12'
          height='3'
          rx='1.5'
          className='fill-tv-mute/60'
        />
        <rect
          x='99'
          y='104.5'
          width='8'
          height='3'
          rx='1.5'
          className='fill-tv-down'
        />
      </g>
      <rect
        x='78'
        y='115'
        width='20'
        height='2'
        rx='1'
        className='fill-tv-dim'
      />
    </>
  );
}
