/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The roles and the degrees laid on one line of time: the rows in order, and the years the line covers.

import type { Doc } from '@/lib/content/schema';
import { isCurrent } from '@/lib/derive/current-job';

/** What a row of the timeline is: a role of the kind it has, or a degree. */
export type TimelineKind = Doc<'experience'>['kind'] | 'degree';

export interface TimelineRow {
  id: string;
  kind: TimelineKind;
  /** the role, or the degree */
  title: string;
  /** the company, or the major of the degree (the school when it has none) */
  subtitle: string;
  startMonth: string;
  endMonth: string | null;
  /** it has no end yet */
  current: boolean;
}

/**
 * The roles and the degrees as rows of one timeline, the one that started first on top. Rows that started in the same month keep the
 * one that ended first above the other (a row with no end goes last), then the order they were given.
 */
export function timelineRows(
  jobs: Pick<
    Doc<'experience'>,
    'id' | 'kind' | 'role' | 'company' | 'startMonth' | 'endMonth'
  >[],
  degrees: Pick<
    Doc<'education'>,
    'id' | 'degree' | 'major' | 'school' | 'startMonth' | 'endMonth'
  >[],
): TimelineRow[] {
  const rows: TimelineRow[] = [
    ...jobs.map((job) => ({
      id: job.id,
      kind: job.kind,
      title: job.role,
      subtitle: job.company,
      startMonth: job.startMonth,
      endMonth: job.endMonth,
      current: isCurrent(job),
    })),
    ...degrees.map((degree) => ({
      id: degree.id,
      kind: 'degree' as const,
      title: degree.degree,
      subtitle: degree.major || degree.school,
      startMonth: degree.startMonth,
      endMonth: degree.endMonth,
      current: isCurrent(degree),
    })),
  ];
  return rows.sort(
    (a, b) =>
      a.startMonth.localeCompare(b.startMonth) ||
      (a.endMonth ?? '9999-12').localeCompare(b.endMonth ?? '9999-12'),
  );
}

/** The calendar years a timeline covers: from the year of its first row to this year, or `null` with no row. */
export function timelineYears(
  rows: Pick<TimelineRow, 'startMonth'>[],
  now: Date,
): { from: number; to: number } | null {
  if (rows.length === 0) return null;
  const first = Math.min(
    ...rows.map((row) => Number(row.startMonth.slice(0, 4))),
  );
  return Number.isFinite(first) ? { from: first, to: now.getFullYear() } : null;
}
