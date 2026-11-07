/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { COLLECTIONS, type Doc } from '@/lib/content/schema';
import {
  careerSpan,
  jobUses,
  monthsUsed,
  rolesUsing,
  SIDE_PROJECTS,
  skillEvidence,
  skillSeries,
  type CareerJob,
} from '@/lib/derive/skill-use';

const now = new Date(2026, 10, 6); // November 2026

const job = (
  id: string,
  startMonth: string,
  endMonth: string | null,
  technologies: string[],
  projectTechnologies: string[] = [],
): CareerJob => ({
  id,
  startMonth,
  endMonth,
  technologies,
  projects: projectTechnologies.length
    ? [
        {
          name: 'p',
          description: '',
          technologies: projectTechnologies,
          highlight: null,
          projectId: '',
        },
      ]
    : [],
});

const jobs = [
  job('c', '2024-01', null, ['kotlin', 'ai']),
  job('b', '2022-05', '2023-12', ['kotlin'], ['react']),
  job('a', '2020-03', '2022-06', ['java']),
];

describe('which roles list a skill', () => {
  it('counts a skill on the role or on one of its projects', () => {
    expect(jobUses(jobs[1], 'kotlin')).toBe(true);
    expect(jobUses(jobs[1], 'react')).toBe(true);
    expect(jobUses(jobs[1], 'java')).toBe(false);
    expect(rolesUsing('kotlin', jobs).map((j) => j.id)).toEqual(['c', 'b']);
    expect(rolesUsing('nothing', jobs)).toEqual([]);
  });
});

describe('monthsUsed', () => {
  it('counts both months of a span and runs the current role to this month', () => {
    // Jan 2024 to Nov 2026 is 35 months, May 2022 to Dec 2023 is 20
    expect(monthsUsed('kotlin', jobs, now)).toBe(35 + 20);
    expect(monthsUsed('ai', jobs, now)).toBe(35);
  });

  it('counts months that two roles share only once', () => {
    const overlap = [
      job('x', '2021-01', '2021-12', ['go']),
      job('y', '2021-07', '2022-06', ['go']),
    ];
    expect(monthsUsed('go', overlap, now)).toBe(18);
    // one role inside another
    const inside = [
      job('x', '2021-01', '2021-12', ['go']),
      job('y', '2021-03', '2021-04', ['go']),
    ];
    expect(monthsUsed('go', inside, now)).toBe(12);
  });

  it('is 0 for a skill no role lists', () => {
    expect(monthsUsed('cobol', jobs, now)).toBe(0);
  });
});

describe('careerSpan and skillSeries', () => {
  it('runs from the year of the first role to this year', () => {
    expect(careerSpan(jobs, now)).toEqual({ from: 2020, to: 2026 });
    expect(careerSpan([], now)).toBeNull();
  });

  it('counts, for each year, the roles that list the skill and were active in it', () => {
    const span = { from: 2020, to: 2026 };
    expect(skillSeries('kotlin', jobs, span, now)).toEqual([
      0, 0, 1, 1, 1, 1, 1,
    ]);
    // java: Mar 2020 to Jun 2022
    expect(skillSeries('java', jobs, span, now)).toEqual([1, 1, 1, 0, 0, 0, 0]);
    // two roles in the same year
    const both = [
      job('p', '2022-01', '2022-06', ['x']),
      job('q', '2022-07', '2022-12', ['x']),
    ];
    expect(skillSeries('x', both, { from: 2021, to: 2023 }, now)).toEqual([
      0, 2, 0,
    ]);
  });
});

describe('skillEvidence', () => {
  it('counts only visible roles, newest first, with the first year', () => {
    const experience = [
      {
        id: 'a',
        visible: true,
        shortName: 'A',
        company: 'A Co',
        startMonth: '2022-05',
        technologies: ['kotlin'],
        projects: [],
      },
      {
        id: 'b',
        visible: true,
        shortName: 'B',
        company: 'B Co',
        startMonth: '2026-01',
        technologies: ['kotlin'],
        projects: [],
      },
      {
        id: 'c',
        visible: false,
        shortName: 'C',
        company: 'C Co',
        startMonth: '2019-07',
        technologies: ['kotlin'],
        projects: [],
      },
    ];
    expect(skillEvidence(experience, []).get('kotlin')).toEqual({
      usedAt: ['B', 'A'],
      since: 2022,
    });
  });
});

describe('the evidence and the months name the same roles', () => {
  const seed = JSON.parse(
    readFileSync('tests/fixtures/seed.json', 'utf8'),
  ) as Record<string, Record<string, unknown>>;
  const docs = <N extends keyof typeof COLLECTIONS>(name: N) =>
    Object.entries(seed[name]).map(([id, raw]) => ({
      id,
      ...COLLECTIONS[name].parse(raw),
    })) as unknown as Doc<N>[];

  it('lists, for every skill of the seed, the places of the roles that use it, and months only when a role does', () => {
    const jobs = docs('experience').filter((j) => j.visible);
    const evidence = skillEvidence(docs('experience'), docs('projects'));
    for (const skill of docs('skills')) {
      const roles = rolesUsing(skill.id, jobs).map(
        (j) => j.shortName || j.company,
      );
      const places = (evidence.get(skill.id)?.usedAt ?? []).filter(
        (label) => label !== SIDE_PROJECTS,
      );
      expect([...places].sort()).toEqual([...new Set(roles)].sort());
      expect(monthsUsed(skill.id, jobs, now) > 0).toBe(roles.length > 0);
    }
  });
});
