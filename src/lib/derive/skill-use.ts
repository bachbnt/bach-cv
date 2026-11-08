/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// What a skill was used in: the roles, the months (overlaps once), the series and the Used at evidence.

import type { Doc, Project } from '@/lib/content/schema';
import { monthSpan, tenureOf } from '@/lib/derive/career-months';

/** What the career numbers read from a role: the dates and the skills the role lists. */
export type CareerJob = Pick<
  Doc<'experience'>,
  'id' | 'startMonth' | 'endMonth' | 'technologies' | 'projects'
>;

/** What decides whether a role lists a skill. */
type SkillsOfJob = Pick<CareerJob, 'technologies' | 'projects'>;

// the dates of a role are read once, in `career-months.ts`: the months used, the tenure of the statement and the series start from it
const spanOf = monthSpan;

/** A role lists a skill when the skill is on the role or on one of its key projects: the same rule as the "Used at" line of Standard. */
export function jobUses(job: SkillsOfJob, skillId: string): boolean {
  return (
    job.technologies.includes(skillId) ||
    job.projects.some((project) => project.technologies.includes(skillId))
  );
}

/** The roles that list a skill, in the order they were given. */
export function rolesUsing<J extends SkillsOfJob>(
  skillId: string,
  jobs: J[],
): J[] {
  return jobs.filter((job) => jobUses(job, skillId));
}

/** How many months a skill was in use: the months of the roles that list it, overlaps counted once. */
export function monthsUsed(
  skillId: string,
  jobs: CareerJob[],
  now: Date,
): number {
  const spans = rolesUsing(skillId, jobs)
    .map((job) => spanOf(job, now))
    .filter(([from, to]) => Number.isFinite(from) && to >= from)
    .sort((a, b) => a[0] - b[0]);
  let total = 0;
  let end = -Infinity;
  for (const [from, to] of spans) {
    if (from > end) {
      total += to - from + 1;
      end = to;
    } else if (to > end) {
      total += to - end;
      end = to;
    }
  }
  return total;
}

/**
 * The calendar years of the career, from the first role to `until`: `'now'` is this year (the years a skill could have been used in),
 * `'last end'` the year the last role ended (the years a statement of the roles needs; this year while a role goes on). `null` with no role.
 */
export function careerSpan(
  jobs: Pick<CareerJob, 'startMonth' | 'endMonth'>[],
  now: Date,
  until: 'now' | 'last end' = 'now',
): { from: number; to: number } | null {
  if (jobs.length === 0) return null;
  const from = Math.min(
    ...jobs.map((job) => Number(job.startMonth.slice(0, 4))),
  );
  if (!Number.isFinite(from)) return null;
  if (until === 'now') return { from, to: now.getFullYear() };
  const last = Math.max(...jobs.map((job) => tenureOf(job, now).end));
  return { from, to: Math.floor(last / 12) };
}

/** The years of a span, oldest first: 2020 to 2022 is `[2020, 2021, 2022]`. */
export const spanYears = (span: { from: number; to: number }): number[] =>
  Array.from(
    { length: Math.max(0, span.to - span.from + 1) },
    (_, i) => span.from + i,
  );

/**
 * The use of a skill across the career: for each year of the span, how many roles that list it were active in it.
 * It counts roles, not hours, and says so where it is shown.
 */
export function skillSeries(
  skillId: string,
  jobs: CareerJob[],
  span: { from: number; to: number },
  now: Date,
): number[] {
  const using = rolesUsing(skillId, jobs);
  const series: number[] = [];
  for (let year = span.from; year <= span.to; year += 1) {
    series.push(
      using.filter((job) => {
        const [from, to] = spanOf(job, now);
        return from <= year * 12 + 11 && to >= year * 12;
      }).length,
    );
  }
  return series;
}

// ---------------------------------------------------------------- "Used at": the places and the first year of a skill

export interface SkillEvidence {
  /** short names of the places it was used, newest first; `Side projects` last */
  usedAt: string[];
  /** first year it appears in any dated item */
  since: number | null;
}

export const SIDE_PROJECTS = 'Side projects';

/**
 * "Used at FPT · MoMo", derived and never stored. In SQL it is the `skill_usage` view; the two must agree. The roles that use a skill
 * are the ones of `rolesUsing`, the same that `monthsUsed` adds up, so the line and the months always name the same roles.
 * Only items that are visible count, so switching a role off also removes it from the evidence.
 */
export const skillEvidence = (
  experience: (SkillsOfJob &
    Pick<
      Doc<'experience'>,
      'visible' | 'shortName' | 'company' | 'startMonth'
    >)[],
  projects: Pick<Project, 'visible' | 'kind' | 'startMonth' | 'technologies'>[],
): Map<string, SkillEvidence> => {
  const jobs = experience.filter((job) => job.visible);
  const personal = projects.filter(
    (project) => project.visible && project.kind === 'personal',
  );
  const skillIds = new Set([
    ...jobs.flatMap((job) => [
      ...job.technologies,
      ...job.projects.flatMap((project) => project.technologies),
    ]),
    ...personal.flatMap((project) => project.technologies),
  ]);
  const out = new Map<string, SkillEvidence>();
  for (const skill of skillIds) {
    const places = [
      ...rolesUsing(skill, jobs).map((job) => ({
        label: job.shortName || job.company,
        month: job.startMonth,
      })),
      ...personal
        .filter((project) => project.technologies.includes(skill))
        .map((project) => ({
          label: SIDE_PROJECTS,
          month: project.startMonth,
        })),
    ];
    const months = places
      .map((place) => place.month)
      .filter((month): month is string => month !== null)
      .sort();
    const labels = new Map<string, string>(); // label -> newest start month
    places.forEach(({ label, month }) => {
      const prev = labels.get(label);
      if (prev === undefined || (month ?? '') > prev)
        labels.set(label, month ?? '');
    });
    const usedAt = [...labels.keys()].sort((a, b) =>
      a === SIDE_PROJECTS
        ? 1
        : b === SIDE_PROJECTS
          ? -1
          : labels.get(b)!.localeCompare(labels.get(a)!) || a.localeCompare(b),
    );
    out.set(skill, {
      usedAt,
      since: months.length ? Number(months[0].slice(0, 4)) : null,
    });
  }
  return out;
};
