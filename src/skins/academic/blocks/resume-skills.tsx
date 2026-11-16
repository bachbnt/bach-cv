/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicResumeCopy } from '@/content/copy/academic-resume';
import { resumeCopy } from '@/content/copy/resume';
import { useSkills } from '@/components/skills/use-skills';
import { useNow } from '@/hooks/use-now';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ResumeCoreStack } from '@/skins/academic/blocks/resume-core-stack';
import { ResumeSkillsSkeleton } from '@/skins/academic/blocks/resume-skills-skeleton';
import { ResumeSkillsSubhead } from '@/skins/academic/blocks/resume-skills-subhead';
import { ResumeSkillsTable } from '@/skins/academic/blocks/resume-skills-table';
import { skillRows } from '@/lib/derive/skill-rows';
import { AcDataState } from '@/skins/academic/ui/ac-data-state';
import { AcHeading } from '@/skins/academic/ui/ac-section';

/** The Skills section: the lead, the core stack, then every listed skill in the table with the months it was used and where. */
export function ResumeSkills() {
  const { skills: copy } = useCopy(resumeCopy);
  const words = useCopy(academicResumeCopy).skills;
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const jobs = useContentQuery('experience');
  const now = useNow();
  const rows = skillRows(skills, jobs.data ?? [], evidence, now);

  return (
    <section
      id='skills'
      aria-labelledby='skills-h'
      className='mt-12 scroll-mt-6'
    >
      <AcHeading id='skills-h'>{copy.title}</AcHeading>
      <p className='mt-3 mb-0 max-w-[62ch] text-ac-mute italic'>{copy.lead}</p>
      <AcDataState
        query={{ isPending, isError, refetch }}
        count={rows.length}
        empty='skills'
        subject='skills'
        level={3}
        className='mt-6'
        skeleton={<ResumeSkillsSkeleton />}
        skeletonClassName=''
      >
        <ResumeSkillsSubhead
          title={copy.core.title}
          lead={copy.core.lead}
          className='mt-8'
        />
        <ResumeCoreStack rows={rows} />
        <ResumeSkillsSubhead
          title={copy.all.title}
          lead={words.allLead}
          className='mt-10'
          leadClassName='mb-4'
        />
        <ResumeSkillsTable rows={rows} />
      </AcDataState>
    </section>
  );
}
