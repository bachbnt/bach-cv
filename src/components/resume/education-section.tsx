/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { EducationList } from '@/components/resume/education-list';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';

/** The Education section of Resume, on the grey band. */
export function EducationSection() {
  const copy = useCopy(resumeCopy);
  return (
    <section aria-labelledby='education-h' className='bg-secondary py-24'>
      <div className='mx-auto w-full max-w-[1200px] px-5 min-[721px]:px-12'>
        <h2 id='education-h' className='text-[30px] min-[721px]:text-[40px]'>
          {copy.education.title}
        </h2>
        <EducationList />
      </div>
    </section>
  );
}
