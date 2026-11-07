/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { TvArtCandles, type ArtCandle } from '@/skins/trade/ui/tv-art-candles';

const CANDLES: ArtCandle[] = [
  [78, 72, 82, 69],
  [72, 75, 78, 70],
  [75, 66, 77, 64],
  [66, 69, 72, 63],
  [69, 60, 71, 58],
  [60, 56, 62, 54],
];

/** Writing: a research note: a title, a tag, lines of text, a figure with a small chart and an arrow, and a caret that blinks at the end of the last line. */
export function TvArtWriting() {
  return (
    <>
      <rect
        x='28'
        y='6'
        width='120'
        height='116'
        rx='4'
        className='fill-tv-panel stroke-tv-line'
      />
      <rect
        x='38'
        y='15'
        width='72'
        height='7'
        rx='2'
        className='fill-tv-ink/85'
      />
      <rect
        x='38'
        y='27'
        width='30'
        height='5'
        rx='2.5'
        className='fill-tv-accent/25'
      />
      <rect
        x='38'
        y='37'
        width='100'
        height='3'
        rx='1.5'
        className='fill-tv-mute/45'
      />
      <rect
        x='38'
        y='43'
        width='92'
        height='3'
        rx='1.5'
        className='fill-tv-mute/45'
      />
      <rect
        x='38'
        y='51'
        width='100'
        height='38'
        rx='3'
        className='fill-tv-bg stroke-tv-line'
      />
      <path
        d='M44 60 H132 M44 72 H132'
        fill='none'
        strokeDasharray='2 3'
        className='stroke-tv-line'
      />
      <TvArtCandles candles={CANDLES} x={52} step={9} width={4.6} />
      <path
        d='M96 76 L124 58'
        pathLength='1'
        fill='none'
        strokeWidth='1.2'
        strokeLinecap='round'
        className='animate-[tv-art-draw_1.2s_ease-out_both] stroke-tv-gold [stroke-dasharray:1]'
      />
      <path
        d='M119 57.5 L124 58 L121.5 62.5'
        fill='none'
        strokeWidth='1.2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='stroke-tv-gold'
      />
      <rect
        x='38'
        y='93'
        width='40'
        height='3'
        rx='1.5'
        className='fill-tv-dim/60'
      />
      <rect
        x='38'
        y='101'
        width='100'
        height='3'
        rx='1.5'
        className='fill-tv-mute/45'
      />
      <rect
        x='38'
        y='107'
        width='58'
        height='3'
        rx='1.5'
        className='fill-tv-mute/45'
      />
      <rect
        x='99'
        y='104'
        width='1.6'
        height='8'
        className='animate-[tv-art-caret_1.1s_steps(1)_infinite] fill-tv-accent'
      />
    </>
  );
}
