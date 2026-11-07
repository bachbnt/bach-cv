/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';
import { careerYears } from '@/lib/derive/career-years';
import { currentJob, firstJob } from '@/lib/derive/current-job';
import { areasWithSkills, type Area } from '@/lib/derive/skill-groups';

export interface DeskFacts {
  /** whole years in software (the number Standard states), or `null` with no job */
  years: number | null;
  /** the job that started first */
  first: { year: number; role: string; company: string } | null;
  /** the job that is not over */
  current: { role: string; company: string } | null;
  /** the areas that have at least one listed skill */
  areas: Area[];
}

/** The real facts of the symbol page, derived from the jobs and the skills; a fact with no data is `null` or empty, never invented. */
export function deskFacts(
  jobs: Pick<
    Doc<'experience'>,
    'startMonth' | 'endMonth' | 'role' | 'company'
  >[],
  skills: Pick<Doc<'skills'>, 'category' | 'listed'>[],
  now: Date,
): DeskFacts {
  const first = firstJob(jobs);
  const current = currentJob(jobs);
  return {
    years: careerYears(
      jobs.map((job) => job.startMonth),
      now,
    ),
    first: first
      ? {
          year: Number(first.startMonth.slice(0, 4)),
          role: first.role,
          company: first.company,
        }
      : null,
    current: current ? { role: current.role, company: current.company } : null,
    areas: areasWithSkills(skills),
  };
}

/** The number shown while it counts up: eased out, whole, and never past the target. `progress` runs from 0 to 1. */
export function countAt(value: number, progress: number): number {
  const t = Math.min(1, Math.max(0, progress));
  return Math.round(value * (1 - (1 - t) ** 3));
}
