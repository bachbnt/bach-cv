/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { useSkills } from '@/components/skills/use-skills';
import { mobaResumeCopy } from '@/content/copy/moba-resume';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ResumeRole } from '@/skins/moba/blocks/resume-role';
import { useGame } from '@/skins/moba/shell/game-context';
import { MbDataState } from '@/skins/moba/ui/mb-data-state';
import { MbSection } from '@/skins/moba/ui/mb-section';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';

/**
 * The Experience section: every role, newest first (the order of the query, current role on top), as the towers of the lane. A tower of
 * the map opens this page with the game's `focus` set on a role: that row picks it up as soon as it is here.
 */
export function ResumeExperience() {
  const copy = useCopy(resumeCopy);
  const mb = useCopy(mobaResumeCopy);
  const query = useContentQuery('experience');
  const { byId } = useSkills();
  const { stops } = useGame();
  const jobs = useMemo(() => query.data ?? [], [query.data]);
  const now = useMemo(() => new Date(), []);
  const towers = useMemo(
    () => new Map(stops.map((stop) => [stop.job.id, stop])),
    [stops],
  );

  return (
    <MbSection
      id='experience'
      kicker={mb.kickers.experience}
      title={copy.experience.title}
      order={1}
    >
      <MbDataState
        query={query}
        count={jobs.length}
        empty='experience'
        subject='experience'
        level={3}
        skeleton={
          <div className='grid gap-4'>
            {[0, 1, 2].map((i) => (
              <MbSkeleton key={i} className='h-[190px]' />
            ))}
          </div>
        }
      >
        <ol className='mb-lane relative m-0 grid list-none gap-4 p-0'>
          {jobs.map((job, index) => (
            <ResumeRole
              key={job.id}
              job={job}
              skills={byId}
              tower={towers.get(job.id)}
              now={now}
              firstOpen={index === 0}
            />
          ))}
        </ol>
      </MbDataState>
    </MbSection>
  );
}
