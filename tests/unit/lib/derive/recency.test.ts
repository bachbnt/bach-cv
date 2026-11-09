/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  issuedNewestFirst,
  issuedOldestFirst,
  latestCertificate,
  newestFirst,
  recencyKey,
} from '@/lib/derive/recency';

const span = (startMonth: string, endMonth: string | null) => ({
  startMonth,
  endMonth,
});

describe('newestFirst', () => {
  it('puts the role with no end first, then the latest end, then the latest start', () => {
    const jobs = [
      span('2018-01', '2020-01'),
      span('2022-05', null),
      span('2019-06', '2020-01'),
      span('2020-02', '2021-09'),
    ];
    expect(newestFirst(jobs)).toEqual([
      span('2022-05', null),
      span('2020-02', '2021-09'),
      span('2019-06', '2020-01'),
      span('2018-01', '2020-01'),
    ]);
    expect(recencyKey(span('2022-05', null))).toBe('9999-12 2022-05');
  });

  it('does not change the list it is given', () => {
    const jobs = [span('2018-01', '2019-01'), span('2020-01', null)];
    newestFirst(jobs);
    expect(jobs[0].startMonth).toBe('2018-01');
  });
});

describe('issuedNewestFirst', () => {
  it('puts the latest issued certificate first', () => {
    const items = [
      { issuedAt: '2021-03-01' },
      { issuedAt: '2024-01-15' },
      { issuedAt: '2022-12-31' },
    ];
    expect(issuedNewestFirst(items).map((c) => c.issuedAt)).toEqual([
      '2024-01-15',
      '2022-12-31',
      '2021-03-01',
    ]);
  });
});

describe('issuedOldestFirst and latestCertificate', () => {
  const items = [
    { id: 'b', issuedAt: '2022-12-31' },
    { id: 'c', issuedAt: '2024-01-15' },
    { id: 'a', issuedAt: '2021-03-01' },
  ];

  it('puts the oldest issued first, and keeps the list it is given', () => {
    expect(issuedOldestFirst(items).map((c) => c.id)).toEqual(['a', 'b', 'c']);
    expect(items.map((c) => c.id)).toEqual(['b', 'c', 'a']);
  });

  it('names the latest issued whatever the order given, and nothing for no certificate', () => {
    expect(latestCertificate(items)?.id).toBe('c');
    expect(latestCertificate([...items].reverse())?.id).toBe('c');
    expect(latestCertificate([])).toBeUndefined();
  });
});
