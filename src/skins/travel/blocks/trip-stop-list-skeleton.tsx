/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';
import { TlSkeletonBar } from '@/skins/travel/ui/tl-skeleton-bar';

/** A list of the stops of the trip before the roles arrive: a node, a title and a period for each, in the heights (one class each) the loaded rows have. */
export function TripStopListSkeleton({
  heights,
}: {
  heights: readonly string[];
}) {
  return (
    <ol className='relative m-0 list-none p-0'>
      {heights.map((height, i) => (
        <li key={i} data-skeleton={i === 0 ? 'item' : undefined}>
          <TlSkeleton
            className={cn(
              'flex items-center gap-3 bg-transparent px-2',
              height,
            )}
          >
            <TlSkeletonBar className='size-7 flex-none rounded-full' />
            <span className='grid grid-cols-1 min-w-0 flex-1 gap-1.5'>
              <TlSkeletonBar className='h-[15px] w-3/5' />
              <TlSkeletonBar className='h-3 w-2/5' />
            </span>
          </TlSkeleton>
        </li>
      ))}
    </ol>
  );
}
