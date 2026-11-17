/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { ROW_SEPARATOR } from '@/skins/phone/blocks/list-row';
import { RESUME_CARDS_GRID } from '@/skins/phone/blocks/resume-layout';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/** The rows of each area of the seed. Every third row is a name alone, the others also say where the skill was used. */
const GROUP_ROWS = [7, 14, 8, 9] as const;

/** Every listed skill by area that is not there yet: a card for each area, in the grid of the loaded page, with its rows. */
export function ResumeSkillGroupsSkeleton() {
  return (
    <div aria-hidden='true' className={RESUME_CARDS_GRID}>
      {GROUP_ROWS.map((rows, group) => (
        <PhCard key={group} className='p-0'>
          <div className='flex items-center justify-between gap-3 px-4 pt-4 pb-2'>
            <PhSkeletonLine line='h-[22px]' className='w-32' />
            <PhSkeleton className='h-3 w-4' />
          </div>
          <ul className='m-0 list-none p-0'>
            {Array.from({ length: rows }, (_, row) => (
              <li
                key={row}
                className={cn(
                  ROW_SEPARATOR,
                  '[--inset:16px] flex items-start gap-3 px-4 py-3',
                )}
              >
                <div className='min-w-0 flex-1'>
                  <PhSkeletonLine line='h-[21.6px]' className='w-1/3' />
                  {row % 3 !== 2 && (
                    <PhSkeletonLine line='mt-0.5 h-[21px]' className='w-3/5' />
                  )}
                  {/* where the skill was used takes a second line on the narrowest screen */}
                  {row % 3 === 0 && (
                    <PhSkeletonLine
                      line='hidden h-[21px] @max-[359px]:flex'
                      className='w-2/5'
                    />
                  )}
                </div>
                <PhSkeleton className='mt-1 h-4 w-14 shrink-0' />
              </li>
            ))}
          </ul>
        </PhCard>
      ))}
    </div>
  );
}
