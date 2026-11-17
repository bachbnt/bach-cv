/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { HINGE_PANES } from '@/skins/phone/blocks/hinge-panes';
import { ROW_SEPARATOR } from '@/skins/phone/blocks/list-row';
import { ResumeRoleDetailSkeleton } from '@/skins/phone/blocks/resume-role-detail-skeleton';
import { ROLES_GRID } from '@/skins/phone/blocks/resume-layout';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/** What the seed has. */
const ROLES = 4;

/**
 * The roles that are not there yet: the list of rows (the logo, the company, the role and the period) and, from a tablet, the role beside
 * it, in the same grid as the loaded page. On a phone only the list is a screen, so the pane is not drawn there.
 */
export function ResumeRolesSkeleton() {
  return (
    <div aria-hidden='true' className={cn(ROLES_GRID, HINGE_PANES)}>
      <div className='min-w-0'>
        <PhCard className='overflow-hidden p-0'>
          <ul className='m-0 list-none p-0'>
            {Array.from({ length: ROLES }, (_, index) => (
              <li key={index} className={cn(ROW_SEPARATOR, '[--inset:78px]')}>
                <div className='flex min-h-[76px] items-center gap-3.5 px-4 py-3.5'>
                  <PhSkeleton className='size-12 shrink-0 rounded-ph-inner' />
                  <div className='min-w-0 flex-1'>
                    <PhSkeletonLine line='h-[20.8px]' className='w-2/5' />
                    <PhSkeletonLine line='mt-0.5 h-[21px]' className='w-3/5' />
                    <PhSkeletonLine
                      line='hidden h-[21px] @max-[359px]:flex'
                      className='w-2/5'
                    />
                    <PhSkeletonLine
                      line='mt-0.5 h-[18.2px]'
                      className='w-1/3'
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </PhCard>
      </div>
      <div className='min-w-0 @max-[899px]:hidden'>
        <ResumeRoleDetailSkeleton />
      </div>
    </div>
  );
}
