/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSkills } from '@/components/skills/use-skills';
import { useContentQuery } from '@/lib/query/use-content';
import { DevExperienceRow } from '@/skins/dev/blocks/experience-row';
import { DevDataState } from '@/skins/dev/ui/dev-data-state';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';

/** Every visible role, newest first (the current one has no end month), the first one open. */
export function DevExperienceList() {
  const query = useContentQuery('experience');
  const { byId } = useSkills();
  const jobs = query.data ?? [];

  return (
    <DevDataState
      query={query}
      count={jobs.length}
      empty='experience'
      subject='experience'
      level={3}
      skeleton={<DevSkeleton style={{ height: 360 }} />}
    >
      <div className='rounded-[8px] border border-line-2 bg-chrome py-1'>
        {jobs.map((job, index) => (
          <DevExperienceRow
            key={job.id}
            job={job}
            skills={byId}
            index={index}
            open={index === 0}
          />
        ))}
      </div>
    </DevDataState>
  );
}
