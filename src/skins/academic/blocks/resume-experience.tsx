/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { resumeCopy } from '@/content/copy/resume';
import { useSkills } from '@/components/skills/use-skills';
import { useNow } from '@/hooks/use-now';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ResumeExperienceSkeleton } from '@/skins/academic/blocks/resume-experience-skeleton';
import { ResumeRole } from '@/skins/academic/blocks/resume-role';
import { AcDataState } from '@/skins/academic/ui/ac-data-state';
import { AcHeading } from '@/skins/academic/ui/ac-section';

/** The Experience section: every visible role, newest first, each a numbered result with its note in the margin. */
export function ResumeExperience() {
  const copy = useCopy(resumeCopy);
  const query = useContentQuery('experience');
  const { byId } = useSkills();
  const now = useNow();
  const jobs = query.data ?? [];

  return (
    <section aria-labelledby='experience-h' className='mt-2'>
      <AcHeading id='experience-h' className='mb-5'>
        {copy.experience.title}
      </AcHeading>
      <AcDataState
        query={query}
        count={jobs.length}
        empty='experience'
        subject='experience'
        level={3}
        className='mt-4'
        skeleton={<ResumeExperienceSkeleton />}
        skeletonClassName=''
      >
        <div className='mt-4'>
          {jobs.map((job, index) => (
            <ResumeRole
              key={job.id}
              job={job}
              number={index + 1}
              skills={byId}
              now={now}
              open={index === 0}
            />
          ))}
        </div>
      </AcDataState>
    </section>
  );
}
