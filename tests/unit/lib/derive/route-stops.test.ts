/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { routeStops } from '@/lib/derive/route-stops';

const NOW = new Date(2026, 10, 7);
const job = (
  id: string,
  kind: string,
  startMonth: string,
  endMonth: string | null,
) => ({ id, kind, startMonth, endMonth });
const degree = (
  id: string,
  school: string,
  startMonth: string,
  endMonth: string | null,
) => ({ id, school, startMonth, endMonth });

describe('routeStops', () => {
  const jobs = [
    job('fpt', 'full-time', '2026-01', null),
    job('acl', 'part-time', '2023-05', '2023-12'),
    job('momo', 'full-time', '2022-05', '2026-01'),
    job('devblock', 'full-time', '2020-03', '2022-04'),
  ];
  const degrees = [
    degree('master', 'USc', '2020-12', '2023-06'),
    degree('bachelor', 'USc', '2016-09', '2020-09'),
  ];

  it('orders the places by the month they were reached, one place per school', () => {
    expect(routeStops(jobs, degrees, NOW).map((s) => s.id)).toEqual([
      'school-bachelor',
      'devblock',
      'momo',
      'acl',
      'fpt',
    ]);
  });

  it('puts a part-time job that overlaps a full-time one on a side trip', () => {
    const stops = routeStops(jobs, degrees, NOW);
    expect(stops.filter((s) => s.side).map((s) => s.id)).toEqual(['acl']);
  });

  it('keeps a part-time job with nothing beside it on the main road', () => {
    const alone = [job('a', 'part-time', '2018-01', '2018-06')];
    expect(routeStops(alone, [], NOW)[0].side).toBe(false);
  });

  it('marks only the job without an end month as current', () => {
    const stops = routeStops(jobs, degrees, NOW);
    expect(stops.filter((s) => s.current).map((s) => s.id)).toEqual(['fpt']);
  });

  it('gives a school the span of all its degrees', () => {
    const [school] = routeStops([], degrees, NOW);
    expect(school).toMatchObject({
      type: 'school',
      startMonth: '2016-09',
      endMonth: '2023-06',
    });
    expect(school.type === 'school' && school.degrees.map((d) => d.id)).toEqual(
      ['bachelor', 'master'],
    );
  });
});
