/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';
import { TlSkeletonBar } from '@/skins/travel/ui/tl-skeleton-bar';

/** A postcard before its project arrives: the picture, the tags, the name, the summary, the technologies and the footer (a card of the strip is 262 wide and 479 tall; stacked, it is full width). */
export function PostcardSkeleton({
  first = false,
  className,
}: {
  first?: boolean;
  className?: string;
}) {
  return (
    <TlSkeleton
      data-skeleton={first ? 'item' : undefined}
      className={cn(
        'flex h-[430px] w-full flex-col gap-2.5 rounded-xl border border-tl-line bg-tl-panel-2 p-3 md:h-[479px] md:w-[262px] md:flex-none',
        className,
      )}
    >
      <TlSkeletonBar className='h-[150px] flex-none rounded-lg' />
      <div className='flex gap-1.5'>
        <TlSkeletonBar className='h-[22px] w-20 rounded-full' />
        <TlSkeletonBar className='h-[22px] w-16 rounded-full' />
      </div>
      <TlSkeletonBar className='h-[22px] w-3/5' />
      <TlSkeletonBar className='h-4' />
      <TlSkeletonBar className='h-4 w-4/5' />
      <div className='flex gap-1.5'>
        <TlSkeletonBar className='h-[26px] w-16 rounded-full' />
        <TlSkeletonBar className='h-[26px] w-20 rounded-full' />
      </div>
      <TlSkeletonBar className='mt-auto h-5' />
    </TlSkeleton>
  );
}
