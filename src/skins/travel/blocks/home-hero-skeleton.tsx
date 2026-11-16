/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';

/** The two counters (years, stops) and the button of the trip of the hero before the roles arrive, as tall as they are once loaded. */
export function HomeHeroSkeleton() {
  return (
    <>
      <ul aria-hidden='true' className='m-0 flex list-none gap-2 p-0'>
        <li className='min-w-[110px] flex-1'>
          <TlSkeleton className='h-[60px]' />
        </li>
        <li className='min-w-[110px] flex-1'>
          <TlSkeleton className='h-[60px]' />
        </li>
      </ul>
      <TlSkeleton className='h-10 w-[150px] rounded-full' />
    </>
  );
}
