/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcSkeletonLine } from '@/skins/academic/ui/ac-skeleton-line';

/** The address and the place that are not written yet: the address stands on the line of the heading (as the loaded link does), the place and the phone under it. */
export function HomeContactSkeleton() {
  return (
    <>
      <AcSkeleton className='-mb-2 mt-6 inline-block h-[34px] w-[198px]' />
      <div className='mt-5'>
        <AcSkeletonLine className='h-[1.58em]' barClassName='w-2/5' />
        <AcSkeletonLine className='h-[1.58em]' barClassName='w-1/3' />
      </div>
    </>
  );
}
