/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import type { Doc } from '@/lib/content/schema';
import { skillRows } from '@/lib/derive/skill-rows';
import { skillEvidence, type CareerJob } from '@/lib/derive/skill-use';

const skill = (
  id: string,
  name: string,
  category: Doc<'skills'>['category'],
  listed = true,
  highlight: number | null = null,
): Doc<'skills'> => ({
  id,
  name,
  category,
  icon: '',
  url: '',
  listed,
  highlight,
  l10n: {},
  sort: 0,
  visible: true,
});

const job = (
  id: string,
  startMonth: string,
  endMonth: string | null,
  technologies: string[],
): CareerJob &
  Pick<Doc<'experience'>, 'visible' | 'shortName' | 'company'> => ({
  id,
  visible: true,
  shortName: id.toUpperCase(),
  company: id,
  startMonth,
  endMonth,
  technologies,
  projects: [],
});

const NOW = new Date(2026, 10, 15);
const skills = [
  skill('kotlin', 'Kotlin', 'mobile'),
  skill('claude', 'Claude Code', 'ai'),
  skill('react', 'React', 'web'),
  skill('hidden', 'Hidden', 'web', false),
  skill('git', 'Git', 'tools'),
];
const jobs = [
  job('a', '2020-01', '2021-12', ['kotlin', 'react']),
  job('b', '2022-01', null, ['kotlin', 'claude']),
];
const rows = skillRows(skills, jobs, skillEvidence(jobs, []), NOW);

describe('skillRows', () => {
  it('has a row for each listed skill, in the order of the areas of Standard', () => {
    expect(rows.map((row) => row.skill.id)).toEqual([
      'claude',
      'kotlin',
      'react',
      'git',
    ]);
  });

  it('takes the months and the places from the shared derivations', () => {
    const kotlin = rows.find((row) => row.skill.id === 'kotlin');
    // Jan 2020 - Nov 2026, the two roles are back to back
    expect(kotlin?.months).toBe(83);
    expect(kotlin?.evidence?.usedAt).toEqual(['B', 'A']);
    expect(rows.find((row) => row.skill.id === 'git')?.months).toBe(0);
  });
});
