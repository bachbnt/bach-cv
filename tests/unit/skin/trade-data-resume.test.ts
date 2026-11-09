/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  barPlacement,
  buildEvents,
  eventsByYear,
  monthsInYear,
} from '@/skins/trade/blocks/data-resume-model';
import { tenureOf } from '@/lib/derive/career-months';
import { careerSpan, spanYears } from '@/lib/derive/skill-use';
import { certificate, degree, job } from './trade-data-fixtures';

const now = new Date(2026, 10, 6);
const jobs = [
  job('c', '2026-01', null, { technologies: ['swift'] }),
  job('b', '2022-05', '2026-01', {
    technologies: ['swift', 'kotlin'],
    projects: [{ name: 'P', technologies: ['firebase', 'ghost'] }],
  }),
  job('a', '2020-03', '2022-04', { technologies: ['kotlin'] }),
];

describe('tenure', () => {
  it('splits the months by calendar year', () => {
    const tenure = tenureOf(jobs[1], now);
    expect(monthsInYear(tenure, 2021)).toBe(0);
    expect(monthsInYear(tenure, 2022)).toBe(8);
    expect(monthsInYear(tenure, 2023)).toBe(12);
    expect(monthsInYear(tenure, 2026)).toBe(1);
    const all = [2022, 2023, 2024, 2025, 2026].map((y) =>
      monthsInYear(tenure, y),
    );
    expect(all.reduce((a, b) => a + b, 0)).toBe(45);
  });

  it('lists the years from the first job to the last month, and none with no job', () => {
    const years = (list: typeof jobs) => {
      const span = careerSpan(list, now, 'last end');
      return span ? spanYears(span) : [];
    };
    expect(years(jobs)).toEqual([2020, 2021, 2022, 2023, 2024, 2025, 2026]);
    expect(years([])).toEqual([]);
    expect(years([jobs[2]])).toEqual([2020, 2021, 2022]);
  });

  it('places a bar as fractions of the year columns', () => {
    const years = spanYears(careerSpan(jobs, now, 'last end')!);
    const first = barPlacement(tenureOf(jobs[2], now), years);
    expect(first.left).toBeCloseTo(2 / (7 * 12));
    expect(first.width).toBeCloseTo(26 / (7 * 12));
    const last = barPlacement(tenureOf(jobs[0], now), years);
    expect(last.left + last.width).toBeCloseTo(1 - 1 / 84);
  });
});

describe('events', () => {
  const events = buildEvents(
    jobs,
    [degree('m', '2020-12', '2023-06')],
    [certificate('x', '2026-10-31'), certificate('y', '2022-05-10')],
  );

  it('lists starts and ends of jobs and degrees and the issue of certificates, newest first', () => {
    expect(events.map((e) => e.id)).toEqual([
      'certificate-x',
      'job-c-start',
      'job-b-end',
      'degree-m-end',
      'certificate-y',
      'job-b-start',
      'job-a-end',
      'degree-m-start',
      'job-a-start',
    ]);
  });

  it('has no end event for a role that is still running', () => {
    expect(events.some((e) => e.id === 'job-c-end')).toBe(false);
  });

  it('keeps the job on its events and groups them by year', () => {
    expect(events.find((e) => e.id === 'job-b-end')!.jobId).toBe('b');
    expect(eventsByYear(events).map((g) => [g.year, g.events.length])).toEqual([
      ['2026', 3],
      ['2023', 1],
      ['2022', 3],
      ['2020', 2],
    ]);
  });
});
