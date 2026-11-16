/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { RESUME_CARDS_GRID } from '@/skins/phone/blocks/resume-layout';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/** What the seed has. */
const DEGREES = 2;

/** The degrees that are not there yet: a card with its picture (16:9), school, period and major, and the box of the thesis. */
export function ResumeEducationSkeleton() {
  return (
    <div aria-hidden='true' className={RESUME_CARDS_GRID}>
      {Array.from({ length: DEGREES }, (_, index) => (
        <PhCard key={index} className='overflow-hidden p-0'>
          <PhSkeleton className='aspect-[16/9] h-auto w-full rounded-none' />
          <div className='p-5'>
            <PhSkeletonLine line='h-[25px]' className='w-3/5' />
            <div className='mt-1'>
              <PhSkeletonLine line='h-[21.75px]' className='w-full' />
              <PhSkeletonLine line='h-[21.75px]' className='w-1/2' />
            </div>
            <div className='mt-3 flex flex-col gap-1.5'>
              <PhSkeletonLine line='h-[21px]' className='w-2/5' />
              <PhSkeletonLine line='h-[21px]' className='w-1/3' />
            </div>
            <div className='mt-4 rounded-ph-inner bg-ph-sheet p-4'>
              <PhSkeleton className='h-6 w-20' />
              <div className='mt-2'>
                <PhSkeletonLine line='h-[23.2px]' className='w-4/5' />
                <PhSkeletonLine
                  line='hidden h-[23.2px] @max-[449px]:flex'
                  className='w-1/2'
                />
              </div>
              <div className='mt-3 flex flex-wrap gap-2'>
                <PhSkeleton className='h-7 w-16' />
                <PhSkeleton className='h-7 w-20' />
                <PhSkeleton className='h-7 w-14' />
              </div>
              <div className='mt-2 flex flex-wrap gap-x-5'>
                <PhSkeletonLine line='h-11' className='w-24' />
                <PhSkeletonLine line='h-11' className='w-24' />
              </div>
            </div>
          </div>
        </PhCard>
      ))}
    </div>
  );
}
