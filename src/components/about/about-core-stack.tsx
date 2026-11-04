/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { CoreStack } from '@/components/skills/core-stack';
import { aboutCopy } from '@/content/copy/about';
import { useCopy } from '@/lib/i18n/copy';

/** The white band under the head: the skills I use every day, with a link to the full list on Resume. */
export function AboutCoreStack() {
  const { core } = useCopy(aboutCopy);
  return (
    <section aria-labelledby='core-h' className='border-y bg-white py-24'>
      <div className='mx-auto w-full max-w-[1200px] px-5 min-[721px]:px-12'>
        <div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
          <h2 id='core-h' className='text-[30px] min-[721px]:text-[40px]'>
            {core.title}
          </h2>
          <Link
            href='/resume#skills'
            className='text-base font-semibold underline underline-offset-4 hover:text-brand pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center'
          >
            {core.all}
          </Link>
        </div>
        <p className='mt-3 max-w-[620px] text-[17px] leading-[1.55] text-[#3a404c]'>
          {core.lead}
        </p>
        <CoreStack className='mt-7' />
      </div>
    </section>
  );
}
