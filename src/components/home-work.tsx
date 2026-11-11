/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { IntentLink } from '@/components/intent-link';
import { WorkRows } from '@/components/work-rows';
import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';

/** "Where I've worked": the section heading, the link to the full resume and the newest roles. */
export function HomeWork() {
  const copy = useCopy(homeCopy);
  return (
    <section
      aria-labelledby='work-h'
      className='mx-auto w-full max-w-[1200px] px-5 pt-20 pb-24 min-[721px]:px-12'
    >
      <div className='mb-7 flex flex-wrap items-baseline justify-between gap-3'>
        <h2 id='work-h' className='text-[30px] min-[721px]:text-[40px]'>
          {copy.work.title}
        </h2>
        <IntentLink
          href='/resume'
          className='text-base font-semibold underline underline-offset-4 hover:text-brand-ink'
        >
          {copy.work.all}
        </IntentLink>
      </div>
      <WorkRows />
    </section>
  );
}
