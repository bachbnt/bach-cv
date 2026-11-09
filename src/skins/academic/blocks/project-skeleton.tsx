/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { HomeCol } from '@/skins/academic/blocks/home-col';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';

/** Three entries of the list that are not written yet: a name, a few lines and a photo taped beside them. */
export function ProjectSkeleton() {
  return (
    <HomeCol className='flex flex-col' aria-hidden='true'>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className='grid gap-6 border-t-2 border-dashed border-ac-faint py-[22px] first:border-t-0 first:pt-0 min-[700px]:grid-cols-[minmax(0,1fr)_200px]'
        >
          <div>
            <AcSkeleton className='mb-3 h-6 w-2/5' />
            <AcSkeleton className='mb-4 h-3 w-16' />
            <AcSkeleton className='mb-2 h-4 w-11/12' />
            <AcSkeleton className='mb-2 h-4 w-4/5' />
            <AcSkeleton className='h-4 w-1/2' />
          </div>
          <div className='ac-paper ac-tape h-[130px] w-full max-w-[200px] -rotate-[1.2deg] rounded-[2px] p-2 odd:rotate-[1.4deg]'>
            <AcSkeleton className='h-full w-full' />
          </div>
        </div>
      ))}
    </HomeCol>
  );
}
