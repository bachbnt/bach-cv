/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { monthSpan, type MonthSpanned } from '@/lib/derive/career-months';

/**
 * The places of a career, in the order they were reached: the school (every degree of one school is one place) and each job. A job
 * that is not full-time and overlaps a full-time job is a side trip. The Travel skin draws them as stops of a trip; a skin that
 * lays the career out as a path asks for them here instead of sorting and grouping on its own.
 */
export interface JobLike extends MonthSpanned {
  id: string;
  kind: string;
}
export interface DegreeLike extends MonthSpanned {
  id: string;
  school: string;
}

export type RouteStop<J extends JobLike, D extends DegreeLike> =
  | {
      type: 'school';
      id: string;
      school: string;
      degrees: D[];
      startMonth: string;
      endMonth: string | null;
      side: false;
      current: false;
    }
  | {
      type: 'job';
      id: string;
      job: J;
      startMonth: string;
      endMonth: string | null;
      side: boolean;
      current: boolean;
    };

const sameRun = (a: MonthSpanned, b: MonthSpanned, now: Date): boolean => {
  const [a1, a2] = monthSpan(a, now);
  const [b1, b2] = monthSpan(b, now);
  return a1 <= b2 && b1 <= a2;
};

export function routeStops<J extends JobLike, D extends DegreeLike>(
  jobs: J[],
  degrees: D[],
  now: Date,
): RouteStop<J, D>[] {
  const schools = new Map<string, D[]>();
  for (const degree of [...degrees].sort((a, b) =>
    a.startMonth.localeCompare(b.startMonth),
  ))
    schools.set(degree.school, [...(schools.get(degree.school) ?? []), degree]);

  const stops: RouteStop<J, D>[] = [];
  for (const [school, list] of schools)
    stops.push({
      type: 'school',
      id: `school-${list[0].id}`,
      school,
      degrees: list,
      startMonth: list[0].startMonth,
      endMonth: list.some((d) => d.endMonth === null)
        ? null
        : ([...list]
            .map((d) => d.endMonth ?? '')
            .sort()
            .at(-1) ?? null),
      side: false,
      current: false,
    });
  const fullTime = jobs.filter((job) => job.kind === 'full-time');
  for (const job of jobs)
    stops.push({
      type: 'job',
      id: job.id,
      job,
      startMonth: job.startMonth,
      endMonth: job.endMonth,
      side:
        job.kind !== 'full-time' &&
        fullTime.some((other) => other !== job && sameRun(job, other, now)),
      current: job.endMonth === null,
    });
  return stops.sort(
    (a, b) =>
      a.startMonth.localeCompare(b.startMonth) || a.id.localeCompare(b.id),
  );
}
