/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/** The filter bar and rows of the screener while the projects load. */
export function DataProjectsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className='grid gap-2 p-3.5'>
      <div className='flex flex-wrap gap-2'>
        <TvSkeleton className='h-[30px] w-44' />
        <TvSkeleton className='h-[26px] w-48' />
        <TvSkeleton className='h-[26px] w-24' />
      </div>
      {Array.from({ length: count }, (_, i) => (
        <TvSkeleton key={i} className='h-9' />
      ))}
    </div>
  );
}
