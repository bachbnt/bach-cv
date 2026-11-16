/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { EDUCATION_GRID } from '@/skins/dev/blocks/education-cards';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevSkeletonBar } from '@/skins/dev/ui/dev-skeleton-bar';

/** The two degrees: a picture, the title, the school and period, and the thesis box. */
export function DevEducationSkeleton() {
  return (
    <div className={EDUCATION_GRID}>
      {[0, 1].map((n) => (
        <DevSkeleton
          key={n}
          data-skeleton={n === 0 ? 'item' : undefined}
          className='h-[528px] max-[1279px]:h-[578px] max-[900px]:h-[522px] max-[620px]:h-[528px]'
        >
          <DevSkeletonBar className='aspect-[21/9] w-full rounded-none border-b border-line-2' />
          <div className='grid gap-2 px-[18px] pt-3.5 pb-[18px]'>
            <DevSkeletonBar className='h-[17px] w-32' />
            <DevSkeletonBar className='h-5 w-4/5' />
            <DevSkeletonBar className='h-[22px] w-3/5' />
            <DevSkeletonBar className='h-[19px] w-2/5' />
            <DevSkeletonBar className='mt-2 h-[120px]' />
          </div>
        </DevSkeleton>
      ))}
    </div>
  );
}
