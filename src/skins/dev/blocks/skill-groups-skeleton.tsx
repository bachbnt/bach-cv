/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevSkeletonBar } from '@/skins/dev/ui/dev-skeleton-bar';
import { SKILL_GROUPS_GRID } from '@/skins/dev/blocks/skill-groups-grid';

/** The four cards of the skills by area, each with a title and the chips of its skills. */
export function SkillGroupsSkeleton() {
  return (
    <div className={SKILL_GROUPS_GRID}>
      {[0, 1, 2, 3].map((n) => (
        <DevSkeleton
          key={n}
          data-skeleton={n === 0 ? 'item' : undefined}
          className='h-[356px] px-[18px] py-4 max-[1279px]:h-[553px] max-[900px]:h-[182px] max-[620px]:h-[174px]'
        >
          <DevSkeletonBar className='h-5 w-1/2' />
          <div className='mt-4 flex flex-wrap gap-[7px]'>
            {[0, 1, 2, 3, 4, 5].map((chip) => (
              <DevSkeletonBar key={chip} className='h-[26px] w-14' />
            ))}
          </div>
        </DevSkeleton>
      ))}
    </div>
  );
}
