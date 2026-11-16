/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicCertificatesServicesCopy } from '@/content/copy/academic-certificates-services';
import { servicesCopy } from '@/content/copy/services';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcSkeletonLine } from '@/skins/academic/ui/ac-skeleton-line';

/** What the seed has: the work packages of the page. */
const PACKAGES = 5;

/**
 * The work packages that are not written yet, in the list of the loaded page (the text stays left of the ruled margin): the number of the
 * package is the page's own, the name and the description blank lines and the button for the form a blank shape.
 */
export function ServiceSkeleton() {
  const copy = useCopy(servicesCopy);
  const own = useCopy(academicCertificatesServicesCopy).services;
  return (
    <ol
      aria-label={copy.list.label}
      className='m-0 list-none p-0 min-[900px]:pr-[308px]'
    >
      {Array.from({ length: PACKAGES }, (_, i) => (
        <li
          key={i}
          aria-hidden='true'
          className='grid grid-cols-1 gap-x-[18px] gap-y-1 border-t-2 border-dashed border-ac-faint py-[18px] min-[561px]:grid-cols-[70px_minmax(0,1fr)]'
        >
          <span className='pt-1 font-ac-chalk text-[28px]/none text-ac-accent'>
            {fill(own.package, { n: i + 1 })}
          </span>
          <div className='min-w-0'>
            <AcSkeletonLine className='h-[34px]' barClassName='h-6 w-2/5' />
            <div className='mt-1.5 mb-2.5'>
              <AcSkeletonLine className='h-[33px]' />
              <AcSkeletonLine className='h-[33px]' barClassName='w-3/5' />
            </div>
            <AcSkeleton className='h-9 w-[113px]' />
          </div>
        </li>
      ))}
    </ol>
  );
}
