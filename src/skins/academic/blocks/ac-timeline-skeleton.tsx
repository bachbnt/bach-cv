/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicHomeAboutCopy } from '@/content/copy/academic-home-about';
import { useCopy } from '@/lib/i18n/copy';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcSkeletonLine } from '@/skins/academic/ui/ac-skeleton-line';

/** What the seed has: the roles and the studies of the figure. */
const ROWS = 6;

/** How far along the years a bar starts and how long it is (blank, decoration only). */
const BARS = [
  'ml-[72%] w-[28%]',
  'ml-[38%] w-[34%]',
  'ml-[26%] w-[16%]',
  'ml-[16%] w-[22%]',
  'ml-[8%] w-[20%]',
  'ml-[2%] w-[24%]',
];

/** Figure 1 that is not drawn yet: the frame, a row for each role and study with its name and its bar, and the caption (its words are the page's own, the years are blank). */
export function AcTimelineSkeleton() {
  const mine = useCopy(academicHomeAboutCopy).home;
  return (
    <figure className='m-0'>
      <div className='border-y-2 border-dashed border-ac-rule pt-4 pb-3'>
        <ol
          aria-hidden='true'
          className='relative m-0 list-none p-0 [--lw:200px]'
        >
          <li className='h-7 max-[760px]:hidden' />
          {BARS.slice(0, ROWS).map((bar, i) => (
            <li
              key={i}
              className='relative grid grid-cols-1 items-center after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:border-b-[1.6px] after:border-dashed after:border-ac-faint after:content-[""] last:after:hidden min-[761px]:h-[63px] min-[761px]:grid-cols-[var(--lw)_1fr]'
            >
              <span className='block py-2 pr-3.5'>
                <AcSkeletonLine
                  className='h-[18px]'
                  barClassName='h-3.5 w-3/5'
                />
                <AcSkeletonLine className='h-[18px]' barClassName='h-3 w-2/5' />
              </span>
              <span className='block h-[38px] py-2'>
                <AcSkeleton className={`h-full ${bar}`} />
              </span>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className='mt-3.5 max-w-[64ch] text-[0.88em]/[1.45]'>
        <b className='mr-1 font-ac-note text-[1.12em] font-normal text-ac-md'>
          {mine.figure.label}
        </b>
        <AcSkeleton className='mr-1 inline-block h-3.5 w-[min(100%,260px)] align-middle' />{' '}
        {mine.figure.legend} {mine.figure.open}
      </figcaption>
    </figure>
  );
}
