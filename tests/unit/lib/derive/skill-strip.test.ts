/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { STRIP_LIMIT, stripSkills } from '@/lib/derive/skill-strip';

const skill = (
  id: string,
  category: 'mobile' | 'web' | 'ai' | 'tools',
  listed = true,
) => ({ id, category, listed });

describe('stripSkills', () => {
  it('lists the listed skills by area, mobile first, in the order they came', () => {
    const out = stripSkills([
      skill('git', 'tools'),
      skill('kotlin', 'mobile'),
      skill('react', 'web'),
      skill('claude', 'ai'),
      skill('swift', 'mobile'),
      skill('hidden', 'web', false),
    ]);
    expect(out.map((s) => s.id)).toEqual([
      'kotlin',
      'swift',
      'react',
      'claude',
      'git',
    ]);
  });

  it('stops at the limit', () => {
    const many = Array.from({ length: 30 }, (_, i) => skill(`s${i}`, 'web'));
    expect(stripSkills(many)).toHaveLength(STRIP_LIMIT);
    expect(stripSkills(many, 3)).toHaveLength(3);
  });
});
