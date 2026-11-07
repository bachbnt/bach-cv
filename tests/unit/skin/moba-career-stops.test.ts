/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { RED_BASE } from '@/skins/moba/world/geometry';
import { careerStops } from '@/skins/moba/world/career-stops';

const job = (id: string, startMonth: string, endMonth: string | null) => ({
  id,
  startMonth,
  endMonth,
});

describe('the career on the map', () => {
  const jobs = [
    job('now', '2024-01', null),
    job('a', '2019-03', '2020-08'),
    job('b', '2020-09', '2023-12'),
  ];

  it('makes the old roles towers in the order they happened and the current one the nexus', () => {
    const stops = careerStops(jobs);
    expect(stops.map((s) => s.job.id)).toEqual(['a', 'b', 'now']);
    expect(stops.map((s) => s.nexus)).toEqual([false, false, true]);
    expect(stops[2].at).toEqual(RED_BASE);
    expect(stops.map((s) => s.n)).toEqual([1, 2, 3]);
    expect(stops.every((s) => s.total === 3)).toBe(true);
  });

  it('walks the towers away from the river: each one further along the lane than the last', () => {
    const stops = careerStops(jobs);
    expect(stops[1].at.x).toBeGreaterThan(stops[0].at.x);
  });

  it('has the nexus alone for one role and nothing for none', () => {
    expect(careerStops([job('only', '2020-01', null)])).toHaveLength(1);
    expect(careerStops([])).toEqual([]);
  });

  it('uses the role that ended last as the nexus when every role is over', () => {
    const over = [
      job('x', '2018-01', '2019-01'),
      job('y', '2019-02', '2021-06'),
    ];
    const stops = careerStops(over);
    expect(stops[stops.length - 1].job.id).toBe('y');
  });
});
