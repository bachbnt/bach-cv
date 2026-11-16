/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { HOME_ROLES } from '@/lib/derive/home-lists';
import { cn } from '@/lib/utils';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcSkeletonLine } from '@/skins/academic/ui/ac-skeleton-line';

/** The latest roles that are not written yet: the rows of the loaded list (a logo, the company, the role and the period, and the tagline beside them). */
export function HomeWorkSkeleton() {
  return (
    <ul
      aria-hidden='true'
      className='m-0 list-none border-t-2 border-dashed border-ac-faint p-0'
    >
      {Array.from({ length: HOME_ROLES }, (_, i) => (
        <li key={i}>
          <div className='flex flex-wrap items-center gap-x-6 gap-y-3 border-b-2 border-dashed border-ac-faint px-1 py-5'>
            <AcSkeleton className='h-[66px] w-[92px] flex-none' />
            <div className='min-w-0 flex-[1_1_220px]'>
              <AcSkeletonLine className='h-[31px]' barClassName='h-5 w-3/5' />
              <AcSkeletonLine className='h-[1.58em]' barClassName='w-1/2' />
              <AcSkeletonLine
                className='mt-0.5 h-[26px]'
                barClassName='w-2/5'
              />
            </div>
            {/* the tagline: beside the title it has four lines (three on a phone), under it, on the width between, two */}
            <div className='min-w-0 flex-[1_1_240px]'>
              {[0, 1, 2, 3].map((line) => (
                <AcSkeletonLine
                  key={line}
                  className={cn(
                    'h-[1.485em]',
                    line === 2 && 'min-[900px]:max-[1189px]:hidden',
                    line === 3 &&
                      'max-[760px]:hidden min-[900px]:max-[1189px]:hidden',
                  )}
                  barClassName={line === 3 ? 'w-3/5' : undefined}
                />
              ))}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
