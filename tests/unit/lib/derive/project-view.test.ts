/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  activeFilterCount,
  ariaSort,
  availableOf,
  columnSortOf,
  nextSort,
  projectSortOf,
  sortProjectsByColumn,
  facetCounts,
  filterProjects,
  isFiltering,
  NO_FILTERS,
  parseProjectQuery,
  parseSavedView,
  projectQueryString,
  resolveProjectView,
  sortProjects,
  splitTechOptions,
  statusOf,
  techOptions,
  toggleValue,
} from '@/lib/derive/project-view';
import {
  liveSchema,
  PROJECT_SORTS,
  projectSchema,
  skillSchema,
  type Doc,
} from '@/lib/content/schema';

type Project = Doc<'projects'>;

const project = (id: string, fields: Record<string, unknown> = {}): Project =>
  ({
    id,
    ...projectSchema.parse({ name: id, ...fields }),
  }) as unknown as Project;

const skill = (id: string, name: string) =>
  [id, { id, ...skillSchema.parse({ name, category: 'web' }) }] as unknown as [
    string,
    Doc<'skills'>,
  ];

const skills = new Map([
  skill('angular', 'Angular'),
  skill('kotlin', 'Kotlin'),
  skill('react', 'ReactJS'),
  skill('swift', 'Swift'),
]);

// the order the owner gave them: a (10), b (20), c (30), d (40), e (50)
const a = project('a', {
  sort: 10,
  name: 'Alpha',
  kind: 'personal',
  startMonth: '2021-02',
  endMonth: null,
  highlight: 2,
  technologies: ['angular', 'react'],
  platforms: ['web'],
  summary: 'A portfolio site',
});
const b = project('b', {
  sort: 20,
  name: 'beta',
  kind: 'freelance',
  startMonth: '2023-09',
  endMonth: '2024-01',
  technologies: ['kotlin'],
  platforms: ['mobile'],
});
const c = project('c', {
  sort: 30,
  name: 'Đồng hồ',
  kind: 'freelance',
  startMonth: null,
  highlight: 1,
  technologies: ['swift', 'kotlin', 'react', 'ghost'],
  platforms: ['mobile', 'desktop'],
  summary: 'Một ứng dụng',
});
const d = project('d', {
  sort: 40,
  name: 'Delta',
  kind: 'personal',
  startMonth: '2026-05',
  endMonth: null,
  technologies: [],
  platforms: [],
});
const e = project('e', {
  sort: 50,
  name: 'Echo',
  kind: 'company',
  startMonth: '2021-02',
  endMonth: '2022-03',
  technologies: ['angular'],
  platforms: ['web', 'ai'],
});
const all = [e, c, a, d, b]; // not in the owner's order on purpose

const ids = (list: Project[]) => list.map((p) => p.id).join('');

describe('statusOf', () => {
  it('is ongoing until the project has an end month', () => {
    expect(statusOf(a)).toBe('ongoing');
    expect(statusOf(b)).toBe('finished');
  });
});

describe('sortProjects', () => {
  it('manual is the owner order (sort, then id), and the input is not touched', () => {
    expect(ids(sortProjects(all, 'manual'))).toBe('abcde');
    expect(ids(all)).toBe('ecadb');
  });

  it('latest goes by the start month, newest first, and a project with none is last', () => {
    // a and e started in the same month: the owner order decides
    expect(ids(sortProjects(all, 'latest'))).toBe('dbaec');
  });

  it('oldest goes the other way, and a project with no start month is still last', () => {
    expect(ids(sortProjects(all, 'oldest'))).toBe('aebdc');
  });

  it('name goes A to Z without caring for case or accents', () => {
    expect(ids(sortProjects(all, 'name'))).toBe('abdce'); // Alpha, beta, Delta, Đồng hồ, Echo
  });

  it('featured puts the ranks first (1, 2), the others after in the owner order', () => {
    expect(ids(sortProjects(all, 'featured'))).toBe('cabde');
  });

  it('technologies puts the project with the most skills first; a skill that does not exist is not counted', () => {
    // c lists 4 but one is not a skill: 3, a 2, then b and e with 1, d with 0
    expect(ids(sortProjects(all, 'technologies', skills))).toBe('cabed');
    // without the skills the raw length is used: c has 4
    expect(ids(sortProjects(all, 'technologies'))).toBe('cabed');
  });
});

describe('sortProjectsByColumn', () => {
  // `all` is e, c, a, d, b: a tie keeps that order
  it('puts the ranks first and keeps a project with no rank last, both ways', () => {
    expect(
      ids(
        sortProjectsByColumn(all, { column: 'featured', dir: 'asc' }, skills),
      ),
    ).toBe('caedb');
    expect(
      ids(
        sortProjectsByColumn(all, { column: 'featured', dir: 'desc' }, skills),
      ),
    ).toBe('acedb');
  });

  it('sorts by name without caring for accents, and by the start month with the undated last both ways', () => {
    expect(
      ids(sortProjectsByColumn(all, { column: 'name', dir: 'desc' }, skills)),
    ).toBe('ecdba');
    expect(
      ids(sortProjectsByColumn(all, { column: 'started', dir: 'asc' }, skills)),
    ).toBe('eabdc');
    expect(
      ids(
        sortProjectsByColumn(all, { column: 'started', dir: 'desc' }, skills),
      ),
    ).toBe('dbeac');
  });

  it('sorts by the technologies (known skills only), the screenshots, the links and the kind in the order of the chips', () => {
    expect(
      ids(
        sortProjectsByColumn(
          all,
          { column: 'technologies', dir: 'desc' },
          skills,
        ),
      ),
    ).toBe('caebd');
    expect(
      ids(sortProjectsByColumn(all, { column: 'kind', dir: 'asc' }, skills)),
    ).toBe('adcbe');
    const withImages = [
      project('x', { images: ['a'] }),
      project('y', { images: ['a', 'b'], links: [{ url: 'u', kind: 'site' }] }),
    ];
    expect(
      ids(
        sortProjectsByColumn(withImages, {
          column: 'screenshots',
          dir: 'desc',
        }),
      ),
    ).toBe('yx');
    expect(
      ids(sortProjectsByColumn(withImages, { column: 'links', dir: 'desc' })),
    ).toBe('yx');
  });

  it('keeps the order they came in for no sort, and leaves the input alone', () => {
    const before = ids(all);
    expect(sortProjectsByColumn(all, null, skills)).toBe(all);
    sortProjectsByColumn(all, { column: 'name', dir: 'asc' }, skills);
    expect(ids(all)).toBe(before);
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

  it('every order of the list is a column of the table, and gives the same list the table gives', () => {
    const manual = sortProjects(all, 'manual', skills);
    for (const sort of PROJECT_SORTS) {
      expect(
        ids(sortProjectsByColumn(manual, columnSortOf(sort), skills)),
      ).toBe(ids(sortProjects(all, sort, skills)));
      expect(projectSortOf(columnSortOf(sort))).toBe(sort);
    }
  });

  it("a click that is not one of the orders of the list is the table's alone", () => {
    expect(projectSortOf({ column: 'kind', dir: 'asc' })).toBeUndefined();
    expect(projectSortOf({ column: 'name', dir: 'desc' })).toBeUndefined();
    expect(projectSortOf(null)).toBe('manual');
  });
});

describe('filterProjects', () => {
  it('shows everything when nothing is chosen', () => {
    expect(filterProjects(all, NO_FILTERS, skills)).toHaveLength(5);
    expect(isFiltering(NO_FILTERS)).toBe(false);
  });

  it('technologies narrow: a project must use all of them', () => {
    const one = filterProjects(all, { ...NO_FILTERS, tech: ['react'] }, skills);
    expect(ids(sortProjects(one, 'manual'))).toBe('ac');
    const two = filterProjects(
      all,
      { ...NO_FILTERS, tech: ['react', 'angular'] },
      skills,
    );
    expect(ids(two)).toBe('a');
  });

  it('inside platform, kind and status it is "or"; between groups it is "and"', () => {
    const mobileOrWeb = filterProjects(
      all,
      { ...NO_FILTERS, platform: ['mobile', 'web'] },
      skills,
    );
    expect(ids(sortProjects(mobileOrWeb, 'manual'))).toBe('abce');
    const andFinished = filterProjects(
      all,
      { ...NO_FILTERS, platform: ['mobile', 'web'], status: ['finished'] },
      skills,
    );
    expect(ids(sortProjects(andFinished, 'manual'))).toBe('be');
    const kinds = filterProjects(
      all,
      { ...NO_FILTERS, kind: ['personal', 'company'] },
      skills,
    );
    expect(ids(sortProjects(kinds, 'manual'))).toBe('ade');
  });

  it('the text finds the name, the summary and the technologies, with no care for case or accents', () => {
    const find = (text: string) =>
      ids(
        sortProjects(
          filterProjects(all, { ...NO_FILTERS, text }, skills),
          'manual',
        ),
      );
    expect(find('dong ho')).toBe('c');
    expect(find('PORTFOLIO')).toBe('a');
    expect(find('kotlin')).toBe('bc');
    expect(find('kotlin dong')).toBe('c');
    expect(find('  ')).toBe('abcde');
    expect(isFiltering({ ...NO_FILTERS, text: ' x ' })).toBe(true);
    expect(isFiltering({ ...NO_FILTERS, text: '  ' })).toBe(false);
  });

  it('an id that is not a skill matches only the projects that list it', () => {
    expect(ids(filterProjects(all, { ...NO_FILTERS, tech: ['ghost'] }))).toBe(
      'c',
    );
    expect(
      ids(filterProjects(all, { ...NO_FILTERS, tech: ['ghost'] }, skills)),
    ).toBe('');
  });
});

describe('facetCounts', () => {
  it('counts a choice with every other filter applied, but not its own group', () => {
    const none = facetCounts(all, NO_FILTERS, skills);
    expect(none.platform.get('mobile')).toBe(2);
    expect(none.platform.get('web')).toBe(2);
    expect(none.kind.get('freelance')).toBe(2);
    expect(none.status.get('ongoing')).toBe(3);
    expect(none.tech.get('kotlin')).toBe(2);
    expect(none.tech.has('ghost')).toBe(false);

    // with "finished" chosen the platforms count only finished projects (b, e); the status counts ignore that choice
    const finished = facetCounts(
      all,
      { ...NO_FILTERS, status: ['finished'] },
      skills,
    );
    expect(finished.platform.get('mobile')).toBe(1);
    expect(finished.platform.get('web')).toBe(1);
    expect(finished.platform.get('desktop')).toBeUndefined();
    expect(finished.status.get('ongoing')).toBe(3);
  });

  it('counts a technology with the ones already picked, because the technologies narrow', () => {
    const counts = facetCounts(all, { ...NO_FILTERS, tech: ['react'] }, skills);
    expect(counts.tech.get('angular')).toBe(1); // a uses react and angular
    expect(counts.tech.get('swift')).toBe(1); // c uses react and swift
    expect(counts.tech.get('react')).toBe(2);
    expect(counts.tech.get('kotlin')).toBe(1);
  });
});

describe('techOptions and splitTechOptions', () => {
  it('lists the skills the projects use, the most used first, then by name', () => {
    expect(techOptions(all, skills)).toEqual([
      { id: 'angular', name: 'Angular', count: 2 },
      { id: 'kotlin', name: 'Kotlin', count: 2 },
      { id: 'react', name: 'ReactJS', count: 2 },
      { id: 'swift', name: 'Swift', count: 1 },
    ]);
  });

  it('keeps the first few and puts the rest behind "More", but never hides one that is picked', () => {
    const options = techOptions(all, skills);
    expect(splitTechOptions(options, [], 2)).toEqual({
      top: options.slice(0, 2),
      more: options.slice(2),
    });
    const picked = splitTechOptions(options, ['swift'], 2);
    expect(picked.top.map((o) => o.id)).toEqual(['angular', 'kotlin', 'swift']);
    expect(picked.more.map((o) => o.id)).toEqual(['react']);
  });

  it('toggleValue adds and removes', () => {
    expect(toggleValue(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleValue(['a', 'b'], 'a')).toEqual(['b']);
  });
});

const config = (live: Record<string, unknown> = {}) =>
  liveSchema.parse({ projects: live }).projects;

describe('resolveProjectView', () => {
  const available = availableOf(all, skills);

  it('offers only what the projects have, in the order of the site', () => {
    expect(available.platform).toEqual(['mobile', 'web', 'desktop', 'ai']);
    expect(available.kind).toEqual(['personal', 'freelance', 'company']);
    expect(available.status).toEqual(['ongoing', 'finished']);
    expect(available.tech.sort()).toEqual([
      'angular',
      'kotlin',
      'react',
      'swift',
    ]);
  });

  it('with nothing said it is the owner order and no filter, and every control shows', () => {
    const view = resolveProjectView({ config: config(), available });
    expect(view.sort.value).toBe('manual');
    expect(view.filters).toEqual(NO_FILTERS);
    expect(view.sort.locked).toBe(false);
    expect(view.groups.platform.visible).toBe(true);
    expect(view.groups.tech.visible).toBe(true);
    expect(view.search.visible).toBe(true);
  });

  it('settles by force, then the address, then the last choice, then the default', () => {
    const live = config({
      sort: { default: 'name' },
      filters: { platform: { default: ['mobile'] } },
    });
    const fromDefault = resolveProjectView({ config: live, available });
    expect(fromDefault.sort.value).toBe('name');
    expect(fromDefault.filters.platform).toEqual(['mobile']);

    const saved = { sort: 'latest', platform: ['web'] };
    const fromSaved = resolveProjectView({ config: live, available, saved });
    expect(fromSaved.sort.value).toBe('latest');
    expect(fromSaved.filters.platform).toEqual(['web']);

    const url = { sort: 'oldest', platform: ['ai'] };
    const fromUrl = resolveProjectView({ config: live, available, url, saved });
    expect(fromUrl.sort.value).toBe('oldest');
    expect(fromUrl.filters.platform).toEqual(['ai']);

    const forced = config({
      sort: { force: 'featured' },
      filters: { platform: { force: ['desktop'] } },
    });
    const fromForce = resolveProjectView({
      config: forced,
      available,
      url,
      saved,
    });
    expect(fromForce.sort.value).toBe('featured');
    expect(fromForce.sort.locked).toBe(true);
    expect(fromForce.filters.platform).toEqual(['desktop']);
    expect(fromForce.groups.platform.forced).toBe(true);
    expect(fromForce.groups.platform.visible).toBe(false);
  });

  it('a skin can open in an order of its own, but the owner and the visitor come first', () => {
    const open = (live: Record<string, unknown>, url = {}) =>
      resolveProjectView({
        config: config(live),
        available,
        fallbackSort: 'featured',
        url,
      }).sort.value;
    expect(open({})).toBe('featured');
    expect(open({ sort: { default: 'name' } })).toBe('name');
    expect(open({ sort: { force: 'latest' } }, { sort: 'oldest' })).toBe(
      'latest',
    );
    expect(open({}, { sort: 'oldest' })).toBe('oldest');
    // the owner left it out: the first order of the site
    expect(open({ sort: { off: ['featured'] } })).toBe('manual');
  });

  it('a group that was cleared in the address stays cleared, and does not fall back to the default', () => {
    const live = config({ filters: { platform: { default: ['mobile'] } } });
    const view = resolveProjectView({
      config: live,
      available,
      url: { platform: [] },
    });
    expect(view.filters.platform).toEqual([]);
  });

  it('leaves out what the owner turned off, and what the projects do not have', () => {
    const live = config({
      sort: { off: ['name', 'latest'] },
      filters: { platform: { off: ['ai'] }, kind: { off: ['company'] } },
    });
    const view = resolveProjectView({
      config: live,
      available,
      url: {
        sort: 'name',
        platform: ['ai', 'web'],
        kind: ['company', 'academic'],
      },
    });
    expect(view.sort.options).not.toContain('name');
    expect(view.sort.value).toBe('manual');
    expect(view.groups.platform.options).toEqual(['mobile', 'web', 'desktop']);
    expect(view.filters.platform).toEqual(['web']);
    // company is left out and the projects have no academic one
    expect(view.filters.kind).toEqual([]);
  });

  it('a technology id is not checked against the projects, only against `off`', () => {
    const view = resolveProjectView({
      config: config({ filters: { tech: { off: ['swift'] } } }),
      available,
      url: { tech: ['angular', 'swift', 'renamed-skill'] },
    });
    expect(view.filters.tech).toEqual(['angular', 'renamed-skill']);
  });

  it('a filter that is switched off is not shown and counts for nothing, but a force still holds', () => {
    const live = config({
      filters: {
        kind: { enabled: false, default: ['personal'] },
        status: { enabled: false, force: ['ongoing'] },
        search: { enabled: false, default: 'portfolio' },
      },
    });
    const view = resolveProjectView({
      config: live,
      available,
      url: { kind: ['freelance'], q: 'hello' },
    });
    expect(view.filters.kind).toEqual([]);
    expect(view.groups.kind.visible).toBe(false);
    expect(view.filters.status).toEqual(['ongoing']);
    expect(view.filters.text).toBe('');
    expect(view.search.visible).toBe(false);
  });

  it('a filter with fewer than two things to choose from is not shown', () => {
    const only = availableOf([a, d], skills);
    const view = resolveProjectView({ config: config(), available: only });
    expect(only.kind).toEqual(['personal']);
    expect(view.groups.kind.visible).toBe(false);
    expect(view.groups.status.visible).toBe(false);
  });

  it('forcing a value that is not allowed counts for nothing', () => {
    const view = resolveProjectView({
      config: config({ filters: { platform: { force: ['ai'], off: ['ai'] } } }),
      available,
    });
    expect(view.groups.platform.forced).toBe(false);
    expect(view.filters.platform).toEqual([]);
  });

  it('the owner can leave out every order but the first, and then there is nothing to choose', () => {
    const view = resolveProjectView({
      config: config({
        sort: { off: ['latest', 'oldest', 'name', 'featured', 'technologies'] },
      }),
      available,
    });
    expect(view.sort.options).toEqual(['manual']);
    expect(view.sort.locked).toBe(true);
  });
});

describe('the address', () => {
  const defaults = resolveProjectView({
    config: config(),
    available: availableOf(all, skills),
  });

  it('reads a choice from the address, and a group with no value as cleared', () => {
    expect(
      parseProjectQuery(
        '?skin=dev&sort=latest&tech=angular,kotlin&platform=&kind=personal&q=hello%20world',
      ),
    ).toEqual({
      sort: 'latest',
      tech: ['angular', 'kotlin'],
      platform: [],
      kind: ['personal'],
      q: 'hello world',
    });
    expect(parseProjectQuery('')).toEqual({});
  });

  it('writes only what differs from the defaults, and keeps the other keys', () => {
    const view = resolveProjectView({
      config: config(),
      available: availableOf(all, skills),
      url: { sort: 'latest', tech: ['angular'], q: 'a b' },
    });
    const query = projectQueryString('?skin=dev', view, defaults);
    expect(parseProjectQuery(query)).toEqual({
      sort: 'latest',
      tech: ['angular'],
      q: 'a b',
    });
    expect(new URLSearchParams(query).get('skin')).toBe('dev');
    expect(projectQueryString(query, defaults, defaults)).toBe('?skin=dev');
    expect(projectQueryString('', defaults, defaults)).toBe('');
  });

  it('a choice that clears a default is written as an empty group', () => {
    const live = config({ filters: { platform: { default: ['mobile'] } } });
    const available = availableOf(all, skills);
    const withDefault = resolveProjectView({ config: live, available });
    const cleared = resolveProjectView({
      config: live,
      available,
      url: { platform: [] },
    });
    const query = projectQueryString('', cleared, withDefault);
    expect(query).toBe('?platform=');
    expect(
      resolveProjectView({
        config: live,
        available,
        url: parseProjectQuery(query),
      }).filters.platform,
    ).toEqual([]);
  });

  it('reads back the last choice, and ignores what is not a choice', () => {
    const kept = JSON.stringify({ sort: 'name', platform: ['web'], q: 'x' });
    expect(parseSavedView(kept)).toEqual({
      sort: 'name',
      platform: ['web'],
      q: 'x',
    });
    expect(parseSavedView(null)).toEqual({});
    expect(parseSavedView('not json')).toEqual({});
    expect(parseSavedView('[1]')).toEqual({});
    expect(parseSavedView('{"sort":4,"tech":["a",3],"q":false}')).toEqual({
      tech: ['a'],
    });
  });
});

describe('activeFilterCount', () => {
  const group = (visible: boolean, selected: string[]) => ({
    visible,
    selected,
  });

  it('adds up the choices of the filters that are shown', () => {
    expect(
      activeFilterCount({
        tech: group(true, ['react', 'flutter']),
        platform: group(true, ['mobile']),
        kind: group(true, []),
      }),
    ).toBe(3);
  });

  it('leaves out a filter that is not shown (the owner fixed it or turned it off)', () => {
    expect(
      activeFilterCount({
        tech: group(true, ['react']),
        platform: group(false, ['mobile', 'web']),
      }),
    ).toBe(1);
  });

  it('is zero when nothing is chosen', () => {
    expect(activeFilterCount({ tech: group(true, []) })).toBe(0);
  });
});
