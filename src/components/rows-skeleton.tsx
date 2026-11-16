/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Skeleton } from '@/components/ui/skeleton';

/** Rows like the experience list: a logo, a company and role, a period. */
export function RowsSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, n) => (
        <div
          key={n}
          className='flex flex-wrap items-center gap-x-8 gap-y-3 border-b px-3 py-5 min-[721px]:px-6 min-[721px]:py-6'
        >
          <Skeleton className='h-20 w-28 flex-none rounded-[10px]' />
          <Skeleton className='h-[33px] min-w-[230px] flex-[0_0_230px]' />
          <div className='min-w-0 flex-[1_1_320px]'>
            <Skeleton className='h-[26px] w-3/5' />
            <Skeleton className='mt-1 h-12 w-4/5 max-[359px]:h-[72px]' />
          </div>
          <Skeleton className='h-[23px] flex-[0_0_170px]' />
        </div>
      ))}
    </div>
  );
}
