/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcSkeletonLine } from '@/skins/academic/ui/ac-skeleton-line';

/** What the seed has: the skills of the core stack. */
const CORE = 5;

/** The cards of the core stack that are not written yet: the grid, the taped paper and the sizes of the loaded ones (a mark, a name and the line of where it was used). */
export function AboutCoreStackSkeleton() {
  return (
    <ul
      aria-hidden='true'
      className='m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-x-5 gap-y-7 p-0'
    >
      {Array.from({ length: CORE }, (_, i) => (
        <li key={i}>
          <div className='ac-paper ac-tape flex h-full flex-col gap-3 rounded-[2px] px-4 pt-5 pb-4'>
            <AcSkeleton className='size-10 flex-none' />
            <div>
              <AcSkeletonLine className='h-7' barClassName='h-5 w-3/5' />
              <AcSkeletonLine
                className='mt-1 h-[26px]'
                barClassName='h-3.5 w-4/5'
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
