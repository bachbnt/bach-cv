/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { DevSkeletonBar } from '@/skins/dev/ui/dev-skeleton-bar';

/**
 * One role of the Source Control graph before its data arrives: the node, the period at the top right, the lines of the text and the
 * picture of the company, in the grid of the real row. `open` is the first role, whose responsibilities are listed and which has no picture.
 */
export function DevExperienceRowSkeleton({
  open = false,
  className,
  ...data
}: {
  open?: boolean;
  className?: string;
  'data-skeleton'?: 'item';
}) {
  return (
    <div
      className={cn(
        'relative grid grid-cols-[22px_1fr_minmax(0,230px)] gap-x-[18px] gap-y-1.5 overflow-hidden border-b border-line px-[22px] pt-[22px] pb-5 last:border-b-0 max-[900px]:grid-cols-[22px_1fr]',
        className,
      )}
      {...data}
    >
      <DevSkeletonBar className='row-start-1 mt-2 size-3 rounded-full' />
      <DevSkeletonBar className='absolute top-[22px] right-[22px] h-[17px] w-[135px] max-[900px]:static max-[900px]:col-start-2 max-[900px]:-order-1' />
      <div className='col-start-2 min-w-0'>
        <DevSkeletonBar className='h-[17px] w-40' />
        <DevSkeletonBar className='mt-2 h-[27px] w-2/5' />
        <DevSkeletonBar className='mt-2 h-[22px] w-1/3' />
        <DevSkeletonBar className='mt-3 h-[52px] max-w-[640px]' />
        <div className='mt-3 flex flex-wrap gap-[7px]'>
          <DevSkeletonBar className='h-[26px] w-16' />
          <DevSkeletonBar className='h-[26px] w-20' />
          <DevSkeletonBar className='h-[26px] w-14' />
          <DevSkeletonBar className='h-[26px] w-[72px]' />
        </div>
        {open && (
          <div className='mt-4 grid gap-3'>
            {Array.from({ length: 12 }, (_, i) => (
              <DevSkeletonBar key={i} className='h-[17px] max-w-[540px]' />
            ))}
          </div>
        )}
      </div>
      {!open && (
        <DevSkeletonBar className='col-start-3 row-start-1 mt-7 aspect-[3/2] self-start rounded-[8px] max-[900px]:col-start-2 max-[900px]:row-auto max-[900px]:mt-1.5 max-[900px]:max-w-[260px]' />
      )}
    </div>
  );
}
