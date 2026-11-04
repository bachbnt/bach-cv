/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExperienceRow } from '@/components/resume/experience-row';
import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';

/** Every visible role, newest first (the current one has no end month). */
export function ExperienceList() {
  const copy = useCopy(resumeCopy);
  const { data, isPending, isError } = useContentQuery('experience');
  const { byId } = useSkills();

  if (isPending)
    return <p className='py-6 text-muted-foreground'>{copy.loading}</p>;
  if (isError)
    return <p className='py-6 text-muted-foreground'>{copy.error}</p>;
  if (!data.length)
    return (
      <p className='py-6 text-muted-foreground'>{copy.experience.empty}</p>
    );

  return (
    <div className='-mx-3 mt-6 border-b min-[721px]:-mx-6'>
      {data.map((job, index) => (
        <ExperienceRow
          key={job.id}
          job={job}
          skills={byId}
          open={index === 0}
        />
      ))}
    </div>
  );
}
