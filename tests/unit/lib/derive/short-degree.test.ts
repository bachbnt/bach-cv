/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { shortDegree } from '@/lib/derive/short-degree';

describe('shortDegree', () => {
  it('abbreviates the degrees it knows, in English and Vietnamese', () => {
    expect(shortDegree('Master of Science')).toBe('MSc');
    expect(shortDegree('Bachelor of Science')).toBe('BSc');
    expect(shortDegree('Master of Engineering')).toBe('MEng');
    expect(shortDegree('Bachelor of Engineering')).toBe('BEng');
    expect(shortDegree('Thạc sĩ Khoa học')).toBe('MSc');
    expect(shortDegree('Cử nhân Khoa học')).toBe('BSc');
  });

  it('keeps any other degree as it is', () => {
    expect(shortDegree('PhD')).toBe('PhD');
    expect(shortDegree('Master of Business Administration')).toBe(
      'Master of Business Administration',
    );
    expect(shortDegree('  Diploma ')).toBe('Diploma');
    expect(shortDegree('Doctor of Philosophy')).toBe('Doctor of Philosophy');
    expect(shortDegree('Master of Business')).toBe('Master of Business');
    expect(shortDegree('  MBA ')).toBe('MBA');
  });
});
