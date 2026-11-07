/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { oldestFirst } from '@/lib/derive/oldest-first';

const job = (id: string, startMonth: string, endMonth: string | null) => ({
  id,
  startMonth,
  endMonth,
});

describe('oldestFirst', () => {
  it('puts the role that started first first, and the one that is not over last', () => {
    const jobs = [
      job('now', '2024-01', null),
      job('first', '2019-03', '2020-08'),
      job('second', '2020-09', '2023-12'),
    ];
    expect(oldestFirst(jobs).map((j) => j.id)).toEqual([
      'first',
      'second',
      'now',
    ]);
  });

  it('does not change the list it is given', () => {
    const jobs = [job('b', '2022-01', null), job('a', '2020-01', '2021-12')];
    oldestFirst(jobs);
    expect(jobs.map((j) => j.id)).toEqual(['b', 'a']);
  });

  it('is empty for no roles', () => {
    expect(oldestFirst([])).toEqual([]);
  });
});
