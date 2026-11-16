/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSkills } from '@/components/skills/use-skills';
import { phoneHomeCopy } from '@/content/copy/phone-home';
import { resumeCopy } from '@/content/copy/resume';
import { coreStack } from '@/lib/derive/core-stack';
import { useCopy } from '@/lib/i18n/copy';
import { AboutCoreRowsSkeleton } from '@/skins/phone/blocks/about-core-rows-skeleton';
import { AboutCoreRows } from '@/skins/phone/blocks/about-core-rows';
import { ResumeSkillGroups } from '@/skins/phone/blocks/resume-skill-groups';
import { PhDataState } from '@/skins/phone/ui/ph-data-state';
import { PhSection } from '@/skins/phone/ui/ph-section';

/** The Skills section of Resume (the end of "See all skills" on About): the lead, the core stack, then every listed skill by area. */
export function ResumeSkills() {
  const { skills: copy } = useCopy(resumeCopy);
  const words = useCopy(phoneHomeCopy).resume;
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const stack = coreStack(skills);

  return (
    <PhSection id='skills' title={copy.title} className='scroll-mt-2'>
      <p className='-mt-1 mb-5 px-1 text-[15px]/[1.5] text-ph-mute'>
        {copy.lead}
      </p>
      <h3 className='mb-1 px-1 text-[19px]/[1.3] font-bold'>
        {copy.core.title}
      </h3>
      <p className='mb-3 px-1 text-[15px]/[1.5] text-ph-mute'>
        {copy.core.lead}
      </p>
      <PhDataState
        query={{ isPending, isError, refetch }}
        count={stack.length}
        empty='coreStack'
        subject='coreStack'
        level={3}
        skeleton={<AboutCoreRowsSkeleton />}
      >
        <AboutCoreRows skills={stack} evidence={evidence} />
      </PhDataState>
      <h3 className='mt-8 mb-1 px-1 text-[19px]/[1.3] font-bold'>
        {copy.all.title}
      </h3>
      <p className='mb-3 px-1 text-[15px]/[1.5] text-ph-mute'>
        {words.allLead}
      </p>
      <ResumeSkillGroups />
    </PhSection>
  );
}
