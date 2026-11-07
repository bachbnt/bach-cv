/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ChartArea, ChartLine, ChartSpline } from 'lucide-react';
import type { ChartType } from '@/skins/trade/chart/chart-types';

/** A small picture of each chart type for the menu: a few candles, hollow candles, bars, Heikin Ashi, a line, an area or a baseline. */
export function TypeIcon({ type }: { type: ChartType }) {
  if (type === 'line') return <ChartLine aria-hidden='true' />;
  if (type === 'area') return <ChartArea aria-hidden='true' />;
  if (type === 'baseline') return <ChartSpline aria-hidden='true' />;
  const hollow = type === 'hollow';
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
    >
      {type === 'bars' ? (
        <>
          <path d='M7 4v16M4 8h3M7 15h3' />
          <path d='M17 3v15M14 6h3M17 12h3' />
        </>
      ) : (
        <>
          <path d='M7 3v18M17 3v18' />
          <rect
            x='4.5'
            y='7'
            width='5'
            height='9'
            rx='1'
            fill={hollow ? 'none' : 'currentColor'}
          />
          <rect
            x='14.5'
            y='5'
            width='5'
            height={type === 'heikin' ? 10 : 7}
            rx='1'
            fill={
              type === 'candles' || type === 'heikin' ? 'currentColor' : 'none'
            }
          />
        </>
      )}
    </svg>
  );
}
