/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { HOME_ROLES } from '@/lib/derive/home-lists';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevSkeletonBar } from '@/skins/dev/ui/dev-skeleton-bar';

/** The latest roles of Home as the bordered list of the loaded page: a logo, the company, the role and the period of each. */
export function HomeWorkSkeleton() {
  return (
    <DevSkeleton>
      {Array.from({ length: HOME_ROLES }, (_, n) => (
        <div
          key={n}
          data-skeleton={n === 0 ? 'item' : undefined}
          className='grid h-[105px] grid-cols-[104px_210px_1fr_auto] items-center gap-5 border-b border-line px-5 py-3.5 last:border-b-0 max-[1279px]:h-[294px] max-[900px]:h-[203px] max-[900px]:grid-cols-[90px_1fr] max-[620px]:h-[268px] max-[359px]:h-[317px]'
        >
          <DevSkeletonBar className='h-16 w-[104px] rounded-[6px]' />
          <DevSkeletonBar className='h-[22px] w-3/4' />
          <DevSkeletonBar className='h-5 w-3/5 max-[900px]:col-start-2' />
          <DevSkeletonBar className='h-[17px] w-28 max-[900px]:col-start-2' />
        </div>
      ))}
    </DevSkeleton>
  );
}
