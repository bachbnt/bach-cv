/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/** The legend line and the rows of the statement while the jobs load. */
export function DataResumeSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className='grid gap-1.5 p-3.5'>
      <TvSkeleton className='h-[26px] w-64' />
      {Array.from({ length: count }, (_, i) => (
        <TvSkeleton key={i} className='h-11' />
      ))}
    </div>
  );
}
