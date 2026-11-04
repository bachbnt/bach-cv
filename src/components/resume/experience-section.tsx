/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExperienceList } from '@/components/resume/experience-list';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';

/** The Experience section of Resume. */
export function ExperienceSection() {
  const copy = useCopy(resumeCopy);
  return (
    <section
      aria-labelledby='experience-h'
      className='mx-auto w-full max-w-[1200px] px-5 pt-14 pb-[72px] min-[721px]:px-12'
    >
      <h2 id='experience-h' className='text-[30px] min-[721px]:text-[40px]'>
        {copy.experience.title}
      </h2>
      <ExperienceList />
    </section>
  );
}
