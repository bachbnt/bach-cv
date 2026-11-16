/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { AcSkeletonLine } from '@/skins/academic/ui/ac-skeleton-line';

/** What the seed has: the skills of the core stack. */
const CORE = 5;

/** The core stack that is not written yet: the grid of the loaded one, each skill a name and the line of where it was used under a chalk bar. */
export function ResumeCoreStackSkeleton() {
  return (
    <ul
      aria-hidden='true'
      className='m-0 mt-4 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-x-6 gap-y-4 p-0'
    >
      {Array.from({ length: CORE }, (_, i) => (
        <li key={i} className='border-l-[3px] border-ac-faint pl-3'>
          <AcSkeletonLine className='h-7' barClassName='h-5 w-3/5' />
          <AcSkeletonLine className='h-[21px]' barClassName='h-3.5 w-4/5' />
        </li>
      ))}
    </ul>
  );
}
