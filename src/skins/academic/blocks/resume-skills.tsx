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
import { ResumeSkillsTable } from '@/skins/academic/blocks/resume-skills-table';
import { skillRows } from '@/skins/academic/blocks/resume-skills-model';
import { AcDataState } from '@/skins/academic/ui/ac-data-state';
import { AcHeading } from '@/skins/academic/ui/ac-section';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';

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
        skeleton={
          <div className='mt-6 grid gap-3'>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <AcSkeleton key={i} className='h-5' />
            ))}
          </div>
        }
      >
        <h3 className='mt-8 mb-0 font-ac-chalk text-[26px]/[1.15] font-normal'>
          {copy.core.title}
        </h3>
        <p className='mt-1 mb-0 text-[0.95em] text-ac-mute'>{copy.core.lead}</p>
        <ResumeCoreStack rows={rows} />
        <h3 className='mt-10 mb-0 font-ac-chalk text-[26px]/[1.15] font-normal'>
          {copy.all.title}
        </h3>
        <p className='mt-1 mb-4 text-[0.95em] text-ac-mute'>{words.allLead}</p>
        <ResumeSkillsTable rows={rows} />
      </AcDataState>
    </section>
  );
}
