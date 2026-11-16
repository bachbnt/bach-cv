/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { CORE_GRID, CORE_MAIN_SPAN } from '@/skins/dev/blocks/core-grid';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevSkeletonBar } from '@/skins/dev/ui/dev-skeleton-bar';

/** The five cards of the core stack (the first one wide), each with an icon, a name and the places it was used. */
export function CoreStackSkeleton() {
  return (
    <div className={CORE_GRID}>
      {[0, 1, 2, 3, 4].map((n) => (
        <DevSkeleton
          key={n}
          data-skeleton={n === 0 ? 'item' : undefined}
          className={cn(
            'flex flex-col gap-3 px-[18px] py-4',
            n === 0
              ? cn(CORE_MAIN_SPAN, 'h-[135px] px-[22px] py-5')
              : n === 1
                ? 'h-[118px] max-[1279px]:h-[135px] max-[900px]:h-[118px]'
                : 'h-[118px] max-[1279px]:h-[163px] max-[900px]:h-[118px]',
          )}
        >
          <div className='flex items-center gap-3'>
            <DevSkeletonBar
              className={cn(
                'flex-none rounded-[10px]',
                n === 0 ? 'size-12' : 'size-10',
              )}
            />
            <DevSkeletonBar className='h-[19px] w-24' />
          </div>
          <DevSkeletonBar className='h-5 w-3/5' />
        </DevSkeleton>
      ))}
    </div>
  );
}
