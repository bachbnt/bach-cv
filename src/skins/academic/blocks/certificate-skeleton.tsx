/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicCertificatesServicesCopy } from '@/content/copy/academic-certificates-services';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { AcPaper } from '@/skins/academic/ui/ac-paper';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcSkeletonLine } from '@/skins/academic/ui/ac-skeleton-line';

/** What the seed has: the certificates of the page. */
const CARDS = 3;

/**
 * The reviewer's cards that are not written yet, on the same paper, grid and sizes as the loaded ones (the first is the latest, with its
 * badge): the number of the reviewer is the page's own, the rest blank shapes and the picture taped at the right.
 */
export function CertificateSkeleton() {
  const own = useCopy(academicCertificatesServicesCopy).certificates;
  return (
    <div className='flex flex-col gap-7 pt-3'>
      {Array.from({ length: CARDS }, (_, i) => (
        <AcPaper
          key={i}
          kind='card'
          wind={false}
          className='grid gap-x-8 gap-y-4 min-[700px]:grid-cols-[minmax(0,1fr)_auto]'
        >
          <div aria-hidden='true' className='min-w-0'>
            <p className='mb-1 font-ac-note text-[17px] text-ac-accent'>
              {fill(own.reviewer, { n: i + 1 })}
            </p>
            {i === 0 && <AcSkeleton className='mb-1.5 h-[33px] w-[85px]' />}
            <AcSkeletonLine
              className='h-[39px] max-[760px]:h-[34px]'
              barClassName='h-6 w-3/5'
            />
            {/* a long name takes two lines on a narrow page */}
            <AcSkeletonLine
              className='hidden h-[34px] max-[760px]:flex'
              barClassName='h-6 w-2/5'
            />
            <div className='mb-1.5' />
            <AcSkeletonLine className='h-[33px]' barClassName='w-2/5' />
            <AcSkeletonLine className='h-[33px]' barClassName='w-1/3' />
            <AcSkeletonLine className='mt-2.5 h-[30px]' barClassName='w-1/2' />
            <AcSkeletonLine
              className='hidden h-[30px] max-[760px]:flex'
              barClassName='w-1/3'
            />
            <AcSkeletonLine
              className='mt-3.5 h-[33px]'
              barClassName='w-[118px]'
            />
          </div>
          <div
            aria-hidden='true'
            className='h-fit w-[210px] max-w-full justify-self-start bg-ac-polaroid p-2 pb-8 shadow-ac-photo min-[700px]:justify-self-end'
          >
            <AcSkeleton className='h-[145px] w-full' />
          </div>
        </AcPaper>
      ))}
    </div>
  );
}
