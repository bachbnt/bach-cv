/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevSkeletonBar } from '@/skins/dev/ui/dev-skeleton-bar';

/** The control row of the Projects page (the prompt line, search, order and filters), in the height it wraps to at each width. */
export function ProjectsToolbarSkeleton() {
  return (
    <DevSkeleton
      data-skeleton='toolbar'
      className='mt-1 mb-[18px] flex h-[50px] flex-wrap items-center gap-x-2.5 gap-y-2 px-3 py-2 max-[1279px]:h-[90px] max-[900px]:h-[50px] max-[620px]:h-[146px]'
    >
      <DevSkeletonBar className='h-5 min-w-[160px] flex-1 max-[620px]:basis-full' />
      <DevSkeletonBar className='h-8 w-[190px]' />
      <DevSkeletonBar className='h-8 w-[89px]' />
      <DevSkeletonBar className='h-8 w-[108px]' />
    </DevSkeleton>
  );
}
