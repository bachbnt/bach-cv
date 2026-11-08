/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { degreeAt, latestDegree } from '@/lib/derive/latest-degree';

describe('latestDegree', () => {
  it('is the degree that started last, whatever the order given', () => {
    const degrees = [
      { id: 'bsc', startMonth: '2014-09' },
      { id: 'msc', startMonth: '2021-09' },
    ];
    expect(latestDegree(degrees)?.id).toBe('msc');
    expect(latestDegree([...degrees].reverse())?.id).toBe('msc');
    expect(degrees[0].id).toBe('bsc');
  });

  it('is undefined with no degree', () => {
    expect(latestDegree([])).toBeUndefined();
  });
});

describe('degreeAt', () => {
  const degrees = [
    { id: 'bsc', startMonth: '2014-09', endMonth: '2018-06' },
    { id: 'msc', startMonth: '2020-12', endMonth: null },
  ];

  it('is the degree in progress at a time, an end month counting whole', () => {
    expect(degreeAt(degrees, new Date(2016, 0, 1).getTime())?.id).toBe('bsc');
    expect(degreeAt(degrees, new Date(2018, 5, 30).getTime())?.id).toBe('bsc');
    expect(degreeAt(degrees, new Date(2018, 6, 1).getTime())).toBeNull();
    expect(degreeAt(degrees, new Date(2030, 0, 1).getTime())?.id).toBe('msc');
    expect(degreeAt(degrees, new Date(2010, 0, 1).getTime())).toBeNull();
  });

  it('is the one that started last when two overlap', () => {
    const overlap = [
      degrees[1],
      { id: 'early', startMonth: '2019-01', endMonth: null },
    ];
    expect(degreeAt(overlap, new Date(2021, 5, 1).getTime())?.id).toBe('msc');
    expect(degreeAt(overlap, new Date(2019, 5, 1).getTime())?.id).toBe('early');
  });
});
