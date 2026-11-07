/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { useSkills } from '@/components/skills/use-skills';
import { careerMonthCount } from '@/lib/derive/career-length';
import { careerYears } from '@/lib/derive/career-years';
import { latestJob } from '@/lib/derive/current-job';
import { coreSkills, listedSkills } from '@/lib/derive/core-skills';
import { useContentQuery } from '@/lib/query/use-content';

/** The ability bar and the scoreboard show four key skills. */
export const KEY_SKILLS = 4;

/**
 * What the champion bar and the scoreboard count: all of it read from the same queries the pages use (they share the cache) and the
 * same pure functions of `lib/derive`, so the numbers are the ones the pages state. Nothing is invented: a count that is not known
 * yet is `null`.
 */
export function useHudData() {
  const skillQuery = useSkills();
  const experience = useContentQuery('experience');
  const projects = useContentQuery('projects');
  const certificates = useContentQuery('certificates');
  const jobs = experience.data;
  const projectList = projects.data;
  const certificateList = certificates.data;
  const now = useMemo(() => new Date(), []);
  return useMemo(() => {
    const starts = (jobs ?? []).map((job) => job.startMonth);
    return {
      years: jobs ? careerYears(starts, now) : null,
      careerMonths: careerMonthCount(starts, now),
      roles: jobs ? jobs.length : null,
      projects: projectList ? projectList.length : null,
      skills: listedSkills(skillQuery.skills).length || null,
      certificates: certificateList ?? [],
      certificateCount: certificateList ? certificateList.length : null,
      key: coreSkills(skillQuery.skills).slice(0, KEY_SKILLS),
      evidence: skillQuery.evidence,
      jobs: jobs ?? [],
      current: jobs ? latestJob(jobs) : undefined,
      now,
    };
  }, [
    jobs,
    projectList,
    certificateList,
    skillQuery.skills,
    skillQuery.evidence,
    now,
  ]);
}
