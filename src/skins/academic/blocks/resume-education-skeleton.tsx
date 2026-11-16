/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcSkeletonLine } from '@/skins/academic/ui/ac-skeleton-line';

/** What the seed has: the degrees of the Education section. */
const DEGREES = 2;

/** The degrees that are not written yet: the school's logo taped beside the degree, the school, the period and the thesis ("Thesis" is the page's own word). */
export function ResumeEducationSkeleton() {
  const copy = useCopy(resumeCopy).education;
  return (
    <div className='mt-6 grid gap-10'>
      {Array.from({ length: DEGREES }, (_, i) => (
        <article
          key={i}
          aria-hidden='true'
          className='grid gap-x-8 gap-y-4 min-[761px]:grid-cols-[minmax(0,220px)_minmax(0,1fr)]'
        >
          <figure className='ac-tape relative m-0 w-full max-w-[220px] bg-ac-polaroid p-2 shadow-ac-photo'>
            <AcSkeleton className='aspect-[4/3] h-auto w-full' />
          </figure>
          <div className='min-w-0'>
            <AcSkeletonLine className='h-[34px]' barClassName='h-6 w-1/2' />
            <AcSkeletonLine className='mt-1 h-[33px]' barClassName='w-3/5' />
            <AcSkeletonLine className='h-[27px]' barClassName='w-2/5' />
            <div className='mt-4 h-[179px] max-[760px]:h-[235px] min-[761px]:max-[899px]:h-[229px] rounded-[10px_5px_12px_6px/6px_12px_5px_10px] border-2 border-dashed border-ac-rule px-4 pt-3 pb-4'>
              <span className='font-ac-note text-[16px] text-ac-md'>
                {copy.thesis}
              </span>
              <AcSkeletonLine
                className='mt-0.5 h-[33px]'
                barClassName='w-4/5'
              />
              <div className='mt-3 flex gap-2'>
                <AcSkeleton className='h-7 w-[69px]' />
                <AcSkeleton className='h-7 w-[59px]' />
                <AcSkeleton className='h-7 w-[89px]' />
              </div>
              <div className='mt-3 flex items-center gap-5'>
                <AcSkeletonLine className='h-[27px] w-[137px]' />
                <AcSkeletonLine className='h-[27px] w-[108px]' />
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
