/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { coreStack } from '@/lib/derive/core-stack';

const skill = (name: string, listed: boolean, highlight: number | null) => ({
  name,
  listed,
  highlight,
});

describe('coreStack', () => {
  it('keeps the listed skills that have a rank, in rank order', () => {
    const skills = [
      skill('Swift', true, 3),
      skill('Git', true, null),
      skill('Kotlin', true, 1),
      skill('KMM', true, 2),
    ];
    expect(coreStack(skills).map((s) => s.name)).toEqual([
      'Kotlin',
      'KMM',
      'Swift',
    ]);
  });

  it('never takes a skill that is not listed, even with a rank', () => {
    const skills = [skill('Hidden', false, 1), skill('Kotlin', true, 2)];
    expect(coreStack(skills).map((s) => s.name)).toEqual(['Kotlin']);
  });

  it('keeps the order of equal ranks and does not touch the input', () => {
    const skills = [skill('B', true, 1), skill('A', true, 1)];
    expect(coreStack(skills).map((s) => s.name)).toEqual(['B', 'A']);
    expect(skills.map((s) => s.name)).toEqual(['B', 'A']);
  });

  it('is empty when nothing is marked', () => {
    expect(coreStack([skill('Git', true, null)])).toEqual([]);
    expect(coreStack([])).toEqual([]);
  });
});
