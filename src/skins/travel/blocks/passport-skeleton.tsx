/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { PASSPORT_STAMPS } from '@/skins/travel/blocks/passport-grid';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';
import { TlSkeletonBar } from '@/skins/travel/ui/tl-skeleton-bar';

/** What each stamp measures once loaded (a round stamp at the left, the text at the right), one class each. */
const STAMPS = [
  'h-[170px] max-md:h-[242px]',
  'h-[177px] max-md:h-[217px]',
  'h-[158px] max-md:h-[217px]',
] as const;

/** The three stamps of the passport on the ruled page of the loaded list. */
export function PassportSkeleton() {
  return (
    <div className={PASSPORT_STAMPS}>
      {STAMPS.map((height, i) => (
        <TlSkeleton
          key={i}
          data-skeleton={i === 0 ? 'item' : undefined}
          className={cn('flex items-start gap-3.5 bg-transparent', height)}
        >
          <TlSkeletonBar className='size-[88px] flex-none rounded-full' />
          <span className='grid grid-cols-1 min-w-0 flex-1 gap-2'>
            <TlSkeletonBar className='h-[19px] w-16 rounded-full' />
            <TlSkeletonBar className='h-[19px] w-4/5' />
            <TlSkeletonBar className='h-4 w-1/2' />
            <TlSkeletonBar className='h-7 w-3/5 rounded-full' />
          </span>
        </TlSkeleton>
      ))}
    </div>
  );
}
