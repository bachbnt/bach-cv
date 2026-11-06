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
          <Skeleton className='h-7 w-[230px] max-w-full' />
          <div className='flex min-w-0 flex-[1_1_320px] flex-col gap-2'>
            <Skeleton className='h-5 w-3/5' />
            <Skeleton className='h-4 w-4/5' />
          </div>
          <Skeleton className='h-4 w-[170px] max-w-full' />
        </div>
      ))}
    </div>
  );
}
