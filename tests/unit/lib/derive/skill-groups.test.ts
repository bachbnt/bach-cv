/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  AREAS,
  areasWithSkills,
  GROUP_ORDER,
  skillGroups,
} from '@/lib/derive/skill-groups';
import { STRIP_ORDER } from '@/lib/derive/skill-strip';

type Category = 'mobile' | 'web' | 'ai' | 'tools';
const skill = (category: Category, listed = true) => ({ category, listed });

describe('skillGroups', () => {
  it('groups the listed skills by area, AI first, and leaves out an empty area', () => {
    const groups = skillGroups([
      skill('tools'),
      skill('mobile'),
      skill('ai'),
      skill('mobile'),
      skill('web', false),
    ]);
    expect(groups.map((g) => [g.category, g.items.length])).toEqual([
      ['ai', 1],
      ['mobile', 2],
      ['tools', 1],
    ]);
    expect(GROUP_ORDER).toEqual(['ai', 'mobile', 'web', 'tools']);
  });

  it('can take another order (the watchlist goes mobile first) with the same skills in the same groups', () => {
    const skills = [
      skill('tools'),
      skill('mobile'),
      skill('ai'),
      skill('web', false),
    ];
    const strip = skillGroups(skills, STRIP_ORDER);
    expect(strip.map((g) => g.category)).toEqual(['mobile', 'ai', 'tools']);
    expect(
      strip
        .flatMap((g) => g.items)
        .sort((a, b) => a.category.localeCompare(b.category)),
    ).toEqual(
      skillGroups(skills)
        .flatMap((g) => g.items)
        .sort((a, b) => a.category.localeCompare(b.category)),
    );
  });
});

describe('areasWithSkills', () => {
  it('lists the areas in the order Mobile, Web, AI, only those with a listed skill, and never tools', () => {
    expect(
      areasWithSkills([
        skill('ai'),
        skill('tools'),
        skill('mobile'),
        skill('web', false),
      ]),
    ).toEqual(['mobile', 'ai']);
    expect(AREAS).toEqual(['mobile', 'web', 'ai']);
  });
});
