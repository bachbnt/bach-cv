/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';
import { TlSkeletonBar } from '@/skins/travel/ui/tl-skeleton-bar';

/** The card of the open stop (its kicker, name, role, period, summary, key project, technologies, notes and the buttons), as tall as the loaded one. */
export function TripGuideSkeleton() {
  return (
    <TlSkeleton
      data-skeleton='detail'
      className='h-[603px] border border-tl-line bg-tl-panel-2 p-4'
    >
      <TlSkeletonBar className='h-[14px] w-24' />
      <TlSkeletonBar className='mt-2 h-[23px] w-3/5' />
      <TlSkeletonBar className='mt-2 h-4 w-2/5' />
      <TlSkeletonBar className='mt-2 h-4 w-1/3' />
      <TlSkeletonBar className='mt-3 h-[78px]' />
      <TlSkeletonBar className='mt-3 h-[171px] rounded-xl' />
      <TlSkeletonBar className='mt-3 h-5' />
      <TlSkeletonBar className='mt-3 h-[105px]' />
      <TlSkeletonBar className='mt-4 h-8 w-1/2 rounded-full' />
    </TlSkeleton>
  );
}
