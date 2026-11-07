/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/** The chart is its own chunk: the terminal paints first and the candles arrive when it has loaded. */
export const ChartSlot = dynamic(
  () => import('@/skins/trade/chart/career-chart').then((m) => m.CareerChart),
  {
    ssr: false,
    loading: () => <TvSkeleton className='absolute inset-0 border-0' />,
  },
);
