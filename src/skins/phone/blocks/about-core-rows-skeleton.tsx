/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { ROW_SEPARATOR } from '@/skins/phone/blocks/list-row';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/** What the seed has: the core stack is five skills. */
const SKILLS = 5;

/** The core stack that is not there yet: a card of rows, each with the mark of the skill, its name and where it was used (`AboutCoreRows`). */
export function AboutCoreRowsSkeleton() {
  return (
    <PhCard aria-hidden='true' className='p-0'>
      <ul className='m-0 list-none p-0'>
        {Array.from({ length: SKILLS }, (_, index) => (
          <li
            key={index}
            className={cn(
              ROW_SEPARATOR,
              '[--inset:74px] flex items-center gap-3.5 px-4 py-3',
            )}
          >
            <PhSkeleton className='size-11 shrink-0 rounded-ph-inner' />
            <div className='min-w-0 flex-1'>
              <PhSkeletonLine line='h-[20.8px]' className='w-1/4' />
              <PhSkeletonLine line='mt-0.5 h-[20.3px]' className='w-2/5' />
            </div>
          </li>
        ))}
      </ul>
    </PhCard>
  );
}
