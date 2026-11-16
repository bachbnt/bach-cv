/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { HOME_PROJECTS } from '@/lib/derive/home-lists';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcSkeletonLine } from '@/skins/academic/ui/ac-skeleton-line';

/** The featured projects that are not written yet: the grid of the loaded one, each a taped photo and a name, a summary of three lines and the technologies under it. */
export function HomeProjectsSkeleton() {
  return (
    <div
      aria-hidden='true'
      className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-x-8 gap-y-10'
    >
      {Array.from({ length: HOME_PROJECTS }, (_, i) => (
        <div key={i}>
          <div className='ac-tape relative bg-ac-polaroid p-2 pb-3 shadow-ac-photo'>
            <AcSkeleton className='h-[194px]' />
          </div>
          <div className='mt-4'>
            <AcSkeletonLine className='h-[30px]' barClassName='h-5 w-3/5' />
            <div className='mt-1'>
              {[0, 1, 2].map((line) => (
                <AcSkeletonLine
                  key={line}
                  className='h-[1.485em]'
                  barClassName={line === 2 ? 'w-3/5' : undefined}
                />
              ))}
            </div>
            <AcSkeletonLine className='mt-1.5 h-6' barClassName='h-3.5 w-2/3' />
          </div>
        </div>
      ))}
    </div>
  );
}
