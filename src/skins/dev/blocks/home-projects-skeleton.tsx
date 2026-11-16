/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { HOME_PROJECTS } from '@/lib/derive/home-lists';
import { cn } from '@/lib/utils';
import { HOME_PROJECTS_GRID } from '@/skins/dev/blocks/home-projects-grid';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevSkeletonBar } from '@/skins/dev/ui/dev-skeleton-bar';

/** The featured project cards of Home (cover, kind, name, summary, tags) in the height they have at each width; the odd one out sits alone in the last row. */
export function HomeProjectsSkeleton() {
  return (
    <div className={HOME_PROJECTS_GRID}>
      {Array.from({ length: HOME_PROJECTS }, (_, n) => (
        <DevSkeleton
          key={n}
          data-skeleton={n === 0 ? 'item' : undefined}
          className={cn(
            'flex h-[406px] flex-col max-[1279px]:h-[397px] max-[900px]:h-[388px] max-[620px]:h-[375px]',
            n === 2 && 'max-[900px]:h-[434px] max-[620px]:h-[422px]',
          )}
        >
          <DevSkeletonBar className='aspect-[16/10] w-full rounded-none border-b border-line-2' />
          <div className='grid gap-2 px-4 pt-3.5 pb-4'>
            <DevSkeletonBar className='h-[21px] w-20 rounded-full' />
            <DevSkeletonBar className='h-[26px] w-3/5' />
            <DevSkeletonBar className='h-[17px]' />
            <DevSkeletonBar className='h-[17px] w-4/5' />
          </div>
        </DevSkeleton>
      ))}
    </div>
  );
}
