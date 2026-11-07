/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { buildMedia } from '@/skins/trade/blocks/data-media-model';
import { degree, job } from './trade-data-fixtures';

describe('buildMedia', () => {
  const jobs = [
    job('c', '2026-01', null, { logo: 'c.webp' }),
    job('b', '2022-05', '2026-01'),
    job('a', '2020-03', '2022-04', { logo: 'a.webp' }),
  ];
  const degrees = [
    { ...degree('m', '2020-12', '2023-06'), logo: 'm.webp' },
    degree('x', '2016-09', '2020-09'),
  ];

  it('puts the roles first and then the degrees, and leaves out what has no picture', () => {
    expect(buildMedia(jobs, degrees).map((m) => m.id)).toEqual([
      'job:c',
      'job:a',
      'degree:m',
    ]);
  });

  it('titles a picture with the company or the school and writes the alt as Standard does', () => {
    const [first, , last] = buildMedia(jobs, degrees);
    expect(first).toMatchObject({ title: 'C', subtitle: 'Role c', alt: 'C' });
    expect(last).toMatchObject({
      title: 'School m',
      alt: 'Degree m, School m',
    });
  });

  it('is empty with no picture', () => {
    expect(buildMedia([], [])).toEqual([]);
  });
});
