/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ServiceGrid } from '@/skins/dev/blocks/service-grid';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevSkeletonBar } from '@/skins/dev/ui/dev-skeleton-bar';

/** The five cards of the loaded grid, each with the drawing, the name and the description, in the height they have at each width. */
export function ServiceListSkeleton() {
  return (
    <ServiceGrid>
      {[0, 1, 2, 3, 4].map((n) => (
        <DevSkeleton
          key={n}
          data-skeleton={n === 0 ? 'item' : undefined}
          className='h-[241px] px-[18px] py-4 max-[1279px]:h-[263px] max-[900px]:h-[218px] max-[620px]:h-[223px]'
        >
          <DevSkeletonBar className='h-[100px] w-full' />
          <DevSkeletonBar className='mt-3 h-5 w-1/2' />
          <DevSkeletonBar className='mt-2 h-4' />
          <DevSkeletonBar className='mt-1.5 h-4 w-4/5' />
        </DevSkeleton>
      ))}
    </ServiceGrid>
  );
}
