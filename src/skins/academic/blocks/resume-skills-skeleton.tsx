/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicResumeCopy } from '@/content/copy/academic-resume';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { ResumeCoreStackSkeleton } from '@/skins/academic/blocks/resume-core-stack-skeleton';
import { ResumeSkillsSubhead } from '@/skins/academic/blocks/resume-skills-subhead';
import { ResumeSkillsTableSkeleton } from '@/skins/academic/blocks/resume-skills-table-skeleton';

/** The core stack and the table of the skills, with the page's own headings and lead lines, and the data parts as blank shapes. */
export function ResumeSkillsSkeleton() {
  const { skills: copy } = useCopy(resumeCopy);
  const words = useCopy(academicResumeCopy).skills;
  return (
    <>
      <ResumeSkillsSubhead
        title={copy.core.title}
        lead={copy.core.lead}
        className='mt-8'
      />
      <ResumeCoreStackSkeleton />
      <ResumeSkillsSubhead
        title={copy.all.title}
        lead={words.allLead}
        className='mt-10'
        leadClassName='mb-4'
      />
      <ResumeSkillsTableSkeleton />
    </>
  );
}
