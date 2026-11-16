/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { HOME_PROJECTS } from '@/lib/derive/home-lists';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';
import { TlSkeletonBar } from '@/skins/travel/ui/tl-skeleton-bar';

/** The featured projects of Home as the rows of the loaded list: a picture at the left, the name, the summary and the technologies. */
export function HomeFeaturedSkeleton() {
  return (
    <ul className='m-0 grid list-none grid-cols-1 gap-2.5 p-0'>
      {Array.from({ length: HOME_PROJECTS }, (_, n) => (
        <li key={n} data-skeleton={n === 0 ? 'item' : undefined}>
          <TlSkeleton className='flex h-[91px] gap-3 bg-tl-panel-2 p-2.5'>
            <TlSkeletonBar className='h-16 w-24 flex-none rounded-xl' />
            <span className='grid grid-cols-1 min-w-0 flex-1 content-start gap-1.5'>
              <TlSkeletonBar className='h-[18px] w-2/5' />
              <TlSkeletonBar className='h-3.5' />
              <TlSkeletonBar className='h-3 w-3/5' />
            </span>
          </TlSkeleton>
        </li>
      ))}
    </ul>
  );
}
