/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import type { Doc } from '@/lib/content/schema';
import { skillEvidence, type CareerJob } from '@/lib/derive/skill-use';
import {
  areasOf,
  filterRows,
  skillRows,
  sortRows,
} from '@/skins/academic/blocks/resume-skills-model';

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
): Doc<'experience'> =>
  ({
    id,
    visible: true,
    shortName: id.toUpperCase(),
    company: id,
    startMonth,
    endMonth,
    technologies,
    projects: [],
  }) as unknown as Doc<'experience'>;

const NOW = new Date(2026, 10, 15);
const skills = [
  skill('kotlin', 'Kotlin', 'mobile'),
  skill('claude', 'Claude Code', 'ai'),
  skill('react', 'React', 'web'),
  skill('hidden', 'Hidden', 'web', false),
  skill('git', 'Git', 'tools'),
];
const jobs: CareerJob[] = [
  job('a', '2020-01', '2021-12', ['kotlin', 'react']),
  job('b', '2022-01', null, ['kotlin', 'claude']),
];
const rows = skillRows(skills, jobs, skillEvidence(jobs as never, []), NOW);

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

describe('areasOf and filterRows', () => {
  it('lists the areas that have a row, in order, and filters by one', () => {
    expect(areasOf(rows)).toEqual(['ai', 'mobile', 'web', 'tools']);
    expect(filterRows(rows, 'web').map((row) => row.skill.id)).toEqual([
      'react',
    ]);
    expect(filterRows(rows, 'all')).toHaveLength(4);
  });
});

describe('sortRows', () => {
  const ids = (list: typeof rows) => list.map((row) => row.skill.id);

  it('sorts by area as Standard does, and the other way round', () => {
    expect(ids(sortRows(rows, 'area', 1, 'en'))).toEqual(ids(rows));
    expect(ids(sortRows(rows, 'area', -1, 'en'))).toEqual([
      'git',
      'react',
      'kotlin',
      'claude',
    ]);
  });

  it('sorts by name and by months, keeping the order of equal rows', () => {
    expect(ids(sortRows(rows, 'name', 1, 'en'))).toEqual([
      'claude',
      'git',
      'kotlin',
      'react',
    ]);
    expect(ids(sortRows(rows, 'months', -1, 'en'))).toEqual([
      'kotlin',
      'claude',
      'react',
      'git',
    ]);
  });

  it('does not change the rows it is given', () => {
    const before = ids(rows);
    sortRows(rows, 'name', -1, 'en');
    expect(ids(rows)).toEqual(before);
  });
});
