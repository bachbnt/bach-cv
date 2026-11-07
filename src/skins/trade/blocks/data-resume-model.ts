/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';
import { monthSpan, spanMonths } from '@/lib/derive/career-months';
import { groupByYear } from '@/lib/derive/group-by-year';

type Job = Doc<'experience'>;
type Degree = Doc<'education'>;
type Certificate = Doc<'certificates'>;

export interface Tenure {
  /** first month of the role, as `monthIndex` */
  start: number;
  /** last month of the role (the current one ends this month) */
  end: number;
  /** months from the first to the last, both counted */
  months: number;
}

export const tenureOf = (
  job: Pick<Job, 'startMonth' | 'endMonth'>,
  now: Date,
): Tenure => {
  const [start, last] = monthSpan(job, now);
  return { start, end: Math.max(start, last), months: spanMonths(job, now) };
};

/** The calendar years the jobs cover, from the first start to the last end, oldest first. Empty with no job. */
export const careerYearsOf = (
  jobs: Pick<Job, 'startMonth' | 'endMonth'>[],
  now: Date,
): number[] => {
  if (jobs.length === 0) return [];
  const spans = jobs.map((job) => tenureOf(job, now));
  const first = Math.floor(Math.min(...spans.map((s) => s.start)) / 12);
  const last = Math.floor(Math.max(...spans.map((s) => s.end)) / 12);
  return Array.from({ length: last - first + 1 }, (_, i) => first + i);
};

/** How many months of `tenure` fall in `year`. */
export const monthsInYear = (tenure: Tenure, year: number): number =>
  Math.max(
    0,
    Math.min(tenure.end, year * 12 + 11) -
      Math.max(tenure.start, year * 12) +
      1,
  );

/** Where the bar of a role starts and how wide it is, as fractions of the width of all the year columns. */
export const barPlacement = (
  tenure: Tenure,
  years: number[],
): { left: number; width: number } => {
  const span = years.length * 12;
  const origin = years[0] * 12;
  return {
    left: (tenure.start - origin) / span,
    width: tenure.months / span,
  };
};

export type EventKind = 'job' | 'degree' | 'certificate';

export interface CareerEvent {
  id: string;
  /** `YYYY-MM` for a job or a degree, `YYYY-MM-DD` for a certificate */
  date: string;
  kind: EventKind;
  phase: 'start' | 'end' | 'issued';
  title: string;
  subtitle: string;
  /** the job an event belongs to, so it can open its note */
  jobId?: string;
}

const KIND_RANK: Record<EventKind, number> = {
  certificate: 0,
  degree: 1,
  job: 2,
};

/** In one month a start comes before an end in a newest-first list, as the new job follows the old one. */
const PHASE_RANK: Record<CareerEvent['phase'], number> = {
  issued: 0,
  start: 0,
  end: 1,
};

/** Jobs and degrees (when they started and when they ended) and certificates (when they were issued), newest first. */
export const buildEvents = (
  jobs: Job[],
  degrees: Degree[],
  certificates: Certificate[],
): CareerEvent[] => {
  const events: CareerEvent[] = [];
  for (const job of jobs) {
    const base = {
      kind: 'job',
      title: job.role,
      subtitle: job.company,
      jobId: job.id,
    } as const;
    events.push({
      ...base,
      id: `job-${job.id}-start`,
      date: job.startMonth,
      phase: 'start',
    });
    if (job.endMonth)
      events.push({
        ...base,
        id: `job-${job.id}-end`,
        date: job.endMonth,
        phase: 'end',
      });
  }
  for (const degree of degrees) {
    const base = {
      kind: 'degree',
      title: degree.degree,
      subtitle: degree.school,
    } as const;
    events.push({
      ...base,
      id: `degree-${degree.id}-start`,
      date: degree.startMonth,
      phase: 'start',
    });
    if (degree.endMonth)
      events.push({
        ...base,
        id: `degree-${degree.id}-end`,
        date: degree.endMonth,
        phase: 'end',
      });
  }
  for (const certificate of certificates)
    events.push({
      id: `certificate-${certificate.id}`,
      date: certificate.issuedAt,
      kind: 'certificate',
      phase: 'issued',
      title: certificate.name,
      subtitle: certificate.issuer,
    });
  const key = (event: CareerEvent) =>
    event.date.length === 7 ? `${event.date}-01` : event.date;
  return events.sort(
    (a, b) =>
      key(b).localeCompare(key(a)) ||
      PHASE_RANK[a.phase] - PHASE_RANK[b.phase] ||
      KIND_RANK[a.kind] - KIND_RANK[b.kind] ||
      a.id.localeCompare(b.id),
  );
};

/** The events grouped by year, newest year first. */
export const eventsByYear = (
  events: CareerEvent[],
): { year: string; events: CareerEvent[] }[] =>
  groupByYear(events, (event) => event.date).map(({ year, items }) => ({
    year,
    events: items,
  }));
