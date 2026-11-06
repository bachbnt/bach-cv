/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { DataState } from '@/components/data-state';
import { ExperienceRow } from '@/components/resume/experience-row';
import { RowsSkeleton } from '@/components/rows-skeleton';
import { useSkills } from '@/components/skills/use-skills';
import { useContentQuery } from '@/lib/query/use-content';

/** Every visible role, newest first (the current one has no end month). */
export function ExperienceList() {
  const query = useContentQuery('experience');
  const { byId } = useSkills();
  const jobs = query.data ?? [];

  return (
    <DataState
      query={query}
      count={jobs.length}
      empty='experience'
      subject='experience'
      level={3}
      skeleton={<RowsSkeleton className='-mx-3 border-t min-[721px]:-mx-6' />}
      className='mt-6'
    >
      <div className='-mx-3 mt-6 border-b min-[721px]:-mx-6'>
        {jobs.map((job, index) => (
          <ExperienceRow
            key={job.id}
            job={job}
            skills={byId}
            open={index === 0}
          />
        ))}
      </div>
    </DataState>
  );
}
