/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  ariaSort,
  filterProjects,
  heatValue,
  isFiltering,
  nextSort,
  NO_FILTERS,
  sortProjects,
  techOptions,
  toggleId,
} from '@/skins/trade/blocks/data-projects-model';
import { project, skillMap } from './trade-data-fixtures';

const skills = skillMap('swift', 'kotlin', 'firebase');
const list = [
  project('alpha', {
    kind: 'freelance',
    technologies: ['swift'],
    summary: 'Một ứng dụng đặt hàng',
  }),
  project('beta', {
    kind: 'personal',
    highlight: 2,
    technologies: ['swift', 'kotlin', 'firebase'],
    images: ['a', 'b'],
  }),
  project('gamma', {
    kind: 'company',
    highlight: 1,
    technologies: ['kotlin', 'ghost'],
    links: [{ url: 'https://x.dev', kind: 'site' }],
  }),
  project('delta', { kind: 'personal' }),
];
const names = (items: typeof list) => items.map((p) => p.name);

describe('sorting', () => {
  it('puts the featured projects first by rank and keeps the rest in order', () => {
    expect(
      names(sortProjects(list, { column: 'featured', dir: 'asc' }, skills)),
    ).toEqual(['gamma', 'beta', 'alpha', 'delta']);
  });

  it('keeps a project with no rank last in both directions', () => {
    expect(
      names(sortProjects(list, { column: 'featured', dir: 'desc' }, skills)),
    ).toEqual(['beta', 'gamma', 'alpha', 'delta']);
  });

  it('sorts by name, by number of technologies (known skills only) and of screenshots', () => {
    expect(
      names(sortProjects(list, { column: 'name', dir: 'desc' }, skills)),
    ).toEqual(['gamma', 'delta', 'beta', 'alpha']);
    expect(
      names(
        sortProjects(list, { column: 'technologies', dir: 'desc' }, skills),
      ),
    ).toEqual(['beta', 'alpha', 'gamma', 'delta']);
    expect(
      names(
        sortProjects(list, { column: 'screenshots', dir: 'desc' }, skills),
      )[0],
    ).toBe('beta');
  });

  it('sorts kinds in the order of the Standard chips and leaves the input alone', () => {
    const before = names(list);
    expect(
      names(sortProjects(list, { column: 'kind', dir: 'asc' }, skills)),
    ).toEqual(['beta', 'delta', 'alpha', 'gamma']);
    expect(names(list)).toEqual(before);
    expect(sortProjects(list, null, skills)).toBe(list);
  });

  it('cycles ascending, descending, default, and says it with aria-sort', () => {
    const first = nextSort(null, 'name');
    expect(first).toEqual({ column: 'name', dir: 'asc' });
    const second = nextSort(first, 'name');
    expect(second).toEqual({ column: 'name', dir: 'desc' });
    expect(nextSort(second, 'name')).toBeNull();
    expect(nextSort(second, 'kind')).toEqual({ column: 'kind', dir: 'asc' });
    expect(ariaSort(first, 'name')).toBe('ascending');
    expect(ariaSort(second, 'name')).toBe('descending');
    expect(ariaSort(second, 'kind')).toBe('none');
  });
});

describe('filtering', () => {
  it('filters by kind and by featured', () => {
    expect(
      names(filterProjects(list, { ...NO_FILTERS, kind: 'personal' }, skills)),
    ).toEqual(['beta', 'delta']);
    expect(
      names(
        filterProjects(list, { ...NO_FILTERS, featuredOnly: true }, skills),
      ),
    ).toEqual(['beta', 'gamma']);
  });

  it('wants every chosen technology', () => {
    expect(
      names(
        filterProjects(
          list,
          { ...NO_FILTERS, technologies: ['swift', 'kotlin'] },
          skills,
        ),
      ),
    ).toEqual(['beta']);
  });

  it('finds text in the name, the summary and the technologies, without accents or case', () => {
    const find = (text: string) =>
      names(filterProjects(list, { ...NO_FILTERS, text }, skills));
    expect(find('ALP')).toEqual(['alpha']);
    expect(find('ung dung dat')).toEqual(['alpha']);
    expect(find('kotlin')).toEqual(['beta', 'gamma']);
    expect(find('kotlin firebase')).toEqual(['beta']);
    expect(find('nothing')).toEqual([]);
  });

  it('knows when something is filtered', () => {
    expect(isFiltering(NO_FILTERS)).toBe(false);
    expect(isFiltering({ ...NO_FILTERS, text: '  ' })).toBe(false);
    expect(isFiltering({ ...NO_FILTERS, featuredOnly: true })).toBe(true);
  });
});

describe('technologies', () => {
  it('lists the skills projects use, the most used first, and ignores unknown ids', () => {
    expect(techOptions(list, skills)).toEqual([
      { id: 'kotlin', name: 'KOTLIN', count: 2 },
      { id: 'swift', name: 'SWIFT', count: 2 },
      { id: 'firebase', name: 'FIREBASE', count: 1 },
    ]);
  });

  it('counts the technologies a tile stands for, known skills only', () => {
    expect(heatValue(list[2], skills)).toBe(1);
    expect(heatValue(list[3], skills)).toBe(0);
  });

  it('toggles an id in a list', () => {
    expect(toggleId(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleId(['a', 'b'], 'a')).toEqual(['b']);
  });
});
