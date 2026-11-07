/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { coreSkills, listedSkills } from '@/lib/derive/core-skills';

const skill = (id: string, listed: boolean, highlight: number | null) => ({
  id,
  listed,
  highlight,
});

describe('the core stack', () => {
  const skills = [
    skill('a', true, 1),
    skill('b', false, 2),
    skill('c', true, null),
    skill('d', true, 3),
  ];

  it('keeps the listed skills that are highlighted, in the order given', () => {
    expect(coreSkills(skills).map((s) => s.id)).toEqual(['a', 'd']);
  });

  it('keeps every listed skill, highlighted or not', () => {
    expect(listedSkills(skills).map((s) => s.id)).toEqual(['a', 'c', 'd']);
  });

  it('is empty with no skill', () => {
    expect(coreSkills([])).toEqual([]);
    expect(listedSkills([])).toEqual([]);
  });
});
