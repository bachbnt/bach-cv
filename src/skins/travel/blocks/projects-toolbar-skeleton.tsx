/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';

/** The control row of the postcards (search, filters, order and the count); it wraps where the loaded one does. */
export function ProjectsToolbarSkeleton() {
  return (
    <div
      data-skeleton='toolbar'
      className='flex flex-wrap items-center gap-x-2 gap-y-1.5'
    >
      <TlSkeleton className='h-8 w-[190px] rounded-full max-md:w-full' />
      <TlSkeleton className='h-8 w-[110px] rounded-full' />
      <TlSkeleton className='h-8 w-[156px] rounded-full' />
      <TlSkeleton className='h-[18px] w-[117px] rounded-md' />
    </div>
  );
}
