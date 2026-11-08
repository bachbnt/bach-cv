/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  currentJob,
  firstJob,
  isCurrent,
  jobAt,
  latestJob,
} from '@/lib/derive/current-job';

const job = (id: string, startMonth: string, endMonth: string | null) => ({
  id,
  startMonth,
  endMonth,
});

const jobs = [
  job('b', '2022-05', null),
  job('a', '2019-06', '2022-04'),
  job('c', '2017-01', '2019-05'),
];

describe('isCurrent', () => {
  it('is true while there is no end month', () => {
    expect(isCurrent({ endMonth: null })).toBe(true);
    expect(isCurrent({ endMonth: '' })).toBe(true);
    expect(isCurrent({ endMonth: '2022-04' })).toBe(false);
  });
});

describe('currentJob', () => {
  it('is the role that is not over, whatever the order given', () => {
    expect(currentJob(jobs)?.id).toBe('b');
    expect(currentJob([...jobs].reverse())?.id).toBe('b');
  });

  it('is the one that started last when several are not over', () => {
    expect(
      currentJob([job('x', '2020-01', null), job('y', '2023-01', null)])?.id,
    ).toBe('y');
  });

  it('is undefined when every role has ended', () => {
    expect(currentJob([jobs[1], jobs[2]])).toBeUndefined();
    expect(currentJob([])).toBeUndefined();
  });
});

describe('firstJob', () => {
  it('is the role that started first, and undefined with no role', () => {
    expect(firstJob(jobs)?.id).toBe('c');
    expect(firstJob([])).toBeUndefined();
  });

  it('does not change the list it is given', () => {
    firstJob(jobs);
    expect(jobs.map((j) => j.id)).toEqual(['b', 'a', 'c']);
  });
});

describe('latestJob', () => {
  it('is the current role, or the one that ended last', () => {
    expect(latestJob(jobs)?.id).toBe('b');
    expect(latestJob([jobs[2], jobs[1]])?.id).toBe('a');
    expect(latestJob([])).toBeUndefined();
  });
});

describe('jobAt', () => {
  const career = [
    job('a', '2020-03', '2022-04'),
    job('b', '2022-05', '2026-01'),
    job('c', '2026-01', null),
  ];

  it('names the role of a time, the newest when two overlap, and none before the first', () => {
    expect(jobAt(career, new Date(2021, 5, 7).getTime())?.id).toBe('a');
    expect(jobAt(career, new Date(2022, 4, 2).getTime())?.id).toBe('b');
    // January 2026 is the last month of B and the first of C
    expect(jobAt(career, new Date(2026, 0, 12).getTime())?.id).toBe('c');
    expect(jobAt(career, new Date(2019, 0, 7).getTime())).toBeNull();
  });

  it('counts the end month whole: the role lasts until the first day of the next month', () => {
    expect(jobAt(career, new Date(2022, 3, 30, 23).getTime())?.id).toBe('a');
    expect(jobAt(career, new Date(2022, 4, 1).getTime())?.id).toBe('b');
  });

  it('never matches a month that is not one', () => {
    expect(jobAt([job('x', 'soon', null)], Date.now())).toBeNull();
  });
});
