/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';

/** Three index cards that are not written yet. */
export function CertificateSkeleton() {
  return (
    <div className='flex flex-col gap-6' aria-hidden='true'>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className='ac-paper ac-ruled rounded-[2px] py-7 pr-7 pl-10'
        >
          <AcSkeleton className='mb-4 h-3 w-24' />
          <AcSkeleton className='mb-3 h-6 w-3/5' />
          <AcSkeleton className='mb-2 h-4 w-2/5' />
          <AcSkeleton className='h-4 w-1/2' />
        </div>
      ))}
    </div>
  );
}
