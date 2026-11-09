/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';

/** Three work packages that are not written yet. */
export function ServiceSkeleton() {
  return (
    <div aria-hidden='true'>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className='grid grid-cols-[70px_1fr] gap-x-[18px] border-t-2 border-dashed border-ac-faint py-[18px]'
        >
          <AcSkeleton className='mt-1.5 h-6 w-12' />
          <div>
            <AcSkeleton className='mb-3 h-6 w-2/5' />
            <AcSkeleton className='mb-2 h-4 w-full' />
            <AcSkeleton className='h-4 w-3/5' />
          </div>
        </div>
      ))}
    </div>
  );
}
