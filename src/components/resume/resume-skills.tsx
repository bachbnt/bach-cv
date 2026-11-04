/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { CoreStack } from '@/components/skills/core-stack';
import { SkillGroups } from '@/components/skills/skill-groups';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';

const sub = 'mt-9 mb-4 flex flex-wrap items-baseline gap-x-3.5 gap-y-1';

/** The Skills section of the Resume page: the core stack, then every listed skill by area. */
export function ResumeSkills() {
  const { skills } = useCopy(resumeCopy);
  return (
    <section
      id='skills'
      aria-labelledby='skills-h'
      className='mx-auto w-full max-w-[1200px] scroll-mt-6 px-5 pt-6 pb-24 min-[721px]:px-12'
    >
      <h2 id='skills-h' className='text-[30px] min-[721px]:text-[40px]'>
        {skills.title}
      </h2>
      <p className='mt-3 max-w-[620px] text-[17px] leading-[1.55] text-[#3a404c]'>
        {skills.lead}
      </p>
      <div className={sub}>
        <h3 className='text-[22px] leading-[1.2]'>{skills.core.title}</h3>
        <p className='text-[15px] text-muted-foreground'>{skills.core.lead}</p>
      </div>
      <CoreStack />
      <div className={sub}>
        <h3 className='text-[22px] leading-[1.2]'>{skills.all.title}</h3>
        <p className='text-[15px] text-muted-foreground'>{skills.all.lead}</p>
      </div>
      <SkillGroups />
    </section>
  );
}
