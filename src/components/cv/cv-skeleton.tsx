/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { LoadingBlock } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

/** A white sheet of grey blocks where the CV will be (name, contacts, then a few sections). */
export function CvSkeleton() {
  return (
    <LoadingBlock className='m-auto flex w-[min(794px,calc(100%-24px))] flex-col gap-6 theme-light rounded-sm bg-white p-10 shadow-[0_2px_12px_rgba(27,31,39,0.18)] max-[720px]:p-6'>
      <div className='flex flex-col gap-3'>
        <Skeleton className='h-8 w-1/2' />
        <Skeleton className='h-4 w-1/3' />
      </div>
      {[0, 1, 2].map((n) => (
        <div key={n} className='flex flex-col gap-2.5'>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-3.5 w-full' />
          <Skeleton className='h-3.5 w-11/12' />
          <Skeleton className='h-3.5 w-4/5' />
        </div>
      ))}
    </LoadingBlock>
  );
}
