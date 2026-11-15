/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// What the Projects page shows: the order of its list, its filters, the counts beside each choice, how the owner's `site/live` settings,
// the address and the visitor's last choice settle them, and how they are written to and read from the address. No React, no DOM.

import {
  PLATFORMS,
  PROJECT_KINDS,
  PROJECT_SORTS,
  PROJECT_STATUSES,
  type Doc,
  type Live,
  type Platform,
  type ProjectSort,
  type ProjectStatus,
} from '@/lib/content/schema';
import { foldText } from '@/lib/fold-text';
import { resolvePreference, type Resolved } from '@/lib/preference/preference';

type Project = Doc<'projects'>;
type Skills = Map<string, Doc<'skills'>>;
type Kind = Project['kind'];

// ---------------------------------------------------------------- the filters

/** The filters made of a list of values; the words typed in the search box are `text`. */
export const FILTER_GROUPS = ['tech', 'platform', 'kind', 'status'] as const;
export type FilterGroup = (typeof FILTER_GROUPS)[number];

export interface ProjectFilters {
  /** skill ids: a project must use all of them */
  tech: string[];
  /** a project must be on one of them */
  platform: Platform[];
  /** a project must be of one of them */
  kind: Kind[];
  /** a project must be in one of them */
  status: ProjectStatus[];
  /** every word must be in the name, the summary or the technologies of the project */
  text: string;
}

export const NO_FILTERS: ProjectFilters = {
  tech: [],
  platform: [],
  kind: [],
  status: [],
  text: '',
};

export const isFiltering = (filters: ProjectFilters): boolean =>
  filters.text.trim() !== '' ||
  FILTER_GROUPS.some((group) => filters[group].length > 0);

/** A project with no end month is still going on. */
export const statusOf = (project: Pick<Project, 'endMonth'>): ProjectStatus =>
  project.endMonth === null ? 'ongoing' : 'finished';

/** The values of one group that a project has. */
const valuesOf = (
  project: Project,
  group: FilterGroup,
  skills?: Skills,
): string[] => {
  switch (group) {
    case 'tech':
      return skills
        ? project.technologies.filter((id) => skills.has(id))
        : project.technologies;
    case 'platform':
      return project.platforms;
    case 'kind':
      return [project.kind];
    case 'status':
      return [statusOf(project)];
  }
};

/** Between the groups it is "and"; inside one it is "or", except for the technologies, which narrow the list as more are picked. */
const matches = (
  project: Project,
  filters: ProjectFilters,
  skills?: Skills,
  words: string[] = foldText(filters.text).split(/\s+/).filter(Boolean),
): boolean => {
  if (
    !filters.tech.every((id) => valuesOf(project, 'tech', skills).includes(id))
  )
    return false;
  for (const group of ['platform', 'kind', 'status'] as const) {
    const wanted: string[] = filters[group];
    if (
      wanted.length > 0 &&
      !valuesOf(project, group).some((value) => wanted.includes(value))
    )
      return false;
  }
  if (words.length === 0) return true;
  const haystack = foldText(
    [
      project.name,
      project.summary,
      ...valuesOf(project, 'tech', skills).map(
        (id) => skills?.get(id)?.name ?? id,
      ),
    ].join(' '),
  );
  return words.every((word) => haystack.includes(word));
};

export const filterProjects = (
  projects: Project[],
  filters: ProjectFilters,
  skills?: Skills,
): Project[] => {
  const words = foldText(filters.text).split(/\s+/).filter(Boolean);
  return projects.filter((project) => matches(project, filters, skills, words));
};

/**
 * How many projects each choice would show: the ones that pass every other filter and have the value (for the technologies, the ones that
 * also use everything already picked), so a choice that would show nothing says 0 before it is clicked.
 */
export const facetCounts = (
  projects: Project[],
  filters: ProjectFilters,
  skills?: Skills,
): Record<FilterGroup, Map<string, number>> => {
  const counts = Object.fromEntries(
    FILTER_GROUPS.map((group) => [group, new Map<string, number>()]),
  ) as Record<FilterGroup, Map<string, number>>;
  for (const group of FILTER_GROUPS) {
    const others = { ...filters, [group]: [] };
    for (const project of filterProjects(projects, others, skills)) {
      if (
        group === 'tech' &&
        !filters.tech.every((id) =>
          valuesOf(project, 'tech', skills).includes(id),
        )
      )
        continue;
      for (const value of valuesOf(project, group, skills))
        counts[group].set(value, (counts[group].get(value) ?? 0) + 1);
    }
  }
  return counts;
};

export interface TechOption {
  id: string;
  name: string;
  /** how many projects use it */
  count: number;
}

/** The technologies a visitor can filter by: the real skills that at least one project uses, the most used first. */
export const techOptions = (
  projects: Project[],
  skills: Skills,
): TechOption[] => {
  const counts = new Map<string, number>();
  for (const project of projects)
    for (const id of project.technologies)
      if (skills.has(id)) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts]
    .map(([id, count]) => ({ id, name: skills.get(id)?.name ?? id, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

/** The technologies to show at first: the most used `max`, and any that is picked; the rest wait behind "More". */
export const splitTechOptions = (
  options: TechOption[],
  selected: string[],
  max = 8,
): { top: TechOption[]; more: TechOption[] } => {
  const top = options.filter((o, i) => i < max || selected.includes(o.id));
  return { top, more: options.filter((o) => !top.includes(o)) };
};

export const toggleValue = <T extends string>(values: T[], value: T): T[] =>
  values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];

// ---------------------------------------------------------------- the order

/** The owner's own order: `sort`, then the id, the same as `resolveItems`. */
const manualOrder = (a: Project, b: Project): number =>
  (a.sort ?? 0) - (b.sort ?? 0) || a.id.localeCompare(b.id);

/** How many technologies a project lists (the ones with no visible skill are not counted when the skills are known). */
export const techCount = (project: Project, skills?: Skills): number =>
  valuesOf(project, 'tech', skills).length;

/** The same compare, with nothing (`null`) always last whichever way it goes. */
const byNullable = <T>(
  a: T | null,
  b: T | null,
  compare: (x: T, y: T) => number,
): number => {
  if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;
  return compare(a, b);
};

/**
 * A copy of `projects` in the order of `sort`. Ties keep the owner's own order, and a project with nothing to sort by (no start month, no
 * rank) is always last: `latest` and `oldest` go by the start month, `featured` by the rank, `technologies` by how many are listed, most first.
 */
export const sortProjects = (
  projects: Project[],
  sort: ProjectSort,
  skills?: Skills,
): Project[] => {
  const base = [...projects].sort(manualOrder);
  switch (sort) {
    case 'manual':
      return base;
    case 'latest':
      return base.sort((a, b) =>
        byNullable(a.startMonth, b.startMonth, (x, y) => y.localeCompare(x)),
      );
    case 'oldest':
      return base.sort((a, b) =>
        byNullable(a.startMonth, b.startMonth, (x, y) => x.localeCompare(y)),
      );
    case 'name':
      return base.sort((a, b) =>
        foldText(a.name).localeCompare(foldText(b.name)),
      );
    case 'featured':
      return base.sort((a, b) =>
        byNullable(a.highlight, b.highlight, (x, y) => x - y),
      );
    case 'technologies':
      return base.sort((a, b) => techCount(b, skills) - techCount(a, skills));
  }
};

// ---------------------------------------------------------------- the sorting of a table

/** The columns a table of projects can be sorted by (the Trade screener): the first, `name`, is always shown. */
export const PROJECT_COLUMNS = [
  'name',
  'kind',
  'featured',
  'started',
  'technologies',
  'screenshots',
  'links',
] as const;
export type ProjectColumn = (typeof PROJECT_COLUMNS)[number];

export type ColumnSort = { column: ProjectColumn; dir: 'asc' | 'desc' } | null;

/** One click on a header: a new column starts ascending, the same one goes descending, then back to the default order. */
export const nextSort = (
  sort: ColumnSort,
  column: ProjectColumn,
): ColumnSort => {
  if (sort?.column !== column) return { column, dir: 'asc' };
  return sort.dir === 'asc' ? { column, dir: 'desc' } : null;
};

export const ariaSort = (
  sort: ColumnSort,
  column: ProjectColumn,
): 'ascending' | 'descending' | 'none' =>
  sort?.column !== column
    ? 'none'
    : sort.dir === 'asc'
      ? 'ascending'
      : 'descending';

/** The number a numeric column sorts by; `null` is a project with nothing there, which is last whichever way it goes. */
const numberOf = (
  project: Project,
  column: ProjectColumn,
  skills?: Skills,
): number | null => {
  switch (column) {
    case 'kind':
      return PROJECT_KINDS.indexOf(project.kind);
    case 'featured':
      return project.highlight;
    case 'technologies':
      return techCount(project, skills);
    case 'screenshots':
      return project.images.length;
    case 'links':
      return project.links.length;
    default:
      return 0;
  }
};

/**
 * A copy of `projects` in the order of a column (`null` keeps the order they came in). Ties keep that order; a project with no rank or no
 * start month is always last. It is what a click on a header does; the six orders of the owner's list (`sortProjects`) are the same maths
 * for the columns they stand for (`projectSortOf`).
 */
export const sortProjectsByColumn = (
  projects: Project[],
  sort: ColumnSort,
  skills?: Skills,
): Project[] => {
  if (!sort) return projects;
  const sign = sort.dir === 'asc' ? 1 : -1;
  const indexed = projects.map((project, index) => ({ project, index }));
  indexed.sort((a, b) => {
    let diff: number;
    if (sort.column === 'name') {
      diff =
        sign * foldText(a.project.name).localeCompare(foldText(b.project.name));
    } else if (sort.column === 'started') {
      const x = a.project.startMonth;
      const y = b.project.startMonth;
      if (x === null || y === null) {
        if (x === y) diff = 0;
        else return x === null ? 1 : -1;
      } else diff = sign * x.localeCompare(y);
    } else {
      const x = numberOf(a.project, sort.column, skills);
      const y = numberOf(b.project, sort.column, skills);
      if (x === null || y === null) {
        if (x === y) diff = 0;
        else return x === null ? 1 : -1;
      } else diff = sign * (x - y);
    }
    return diff || a.index - b.index;
  });
  return indexed.map((entry) => entry.project);
};

/** The column and the direction an order of the list stands for in a table (`manual` is the order they come in). */
export const columnSortOf = (sort: ProjectSort): ColumnSort => {
  switch (sort) {
    case 'manual':
      return null;
    case 'latest':
      return { column: 'started', dir: 'desc' };
    case 'oldest':
      return { column: 'started', dir: 'asc' };
    case 'name':
      return { column: 'name', dir: 'asc' };
    case 'featured':
      return { column: 'featured', dir: 'asc' };
    case 'technologies':
      return { column: 'technologies', dir: 'desc' };
  }
};

/** The order of the list a click on a header has come to, if there is one (`name` going down, or `kind`, are only a table's). */
export const projectSortOf = (sort: ColumnSort): ProjectSort | undefined =>
  PROJECT_SORTS.find((candidate) => {
    const mine = columnSortOf(candidate);
    return mine?.column === sort?.column && mine?.dir === sort?.dir;
  });

// ---------------------------------------------------------------- the owner's settings, the address and the last choice

/** What the owner says in `site/live`, `projects`. */
export type ProjectsConfig = Live['projects'];

/** A choice as it is kept (in the address, in the browser): a group that is not there was not chosen, an empty one was cleared. */
export interface RawView {
  sort?: string;
  tech?: string[];
  platform?: string[];
  kind?: string[];
  status?: string[];
  q?: string;
}

export interface ResolvedGroup {
  /** what is selected */
  values: string[];
  /** what the filter offers, in order; for the technologies it is every skill a project uses, not narrowed by the owner's `off` alone */
  options: string[];
  /** the owner has fixed the values: the filter is not shown and the visitor's choice counts for nothing */
  forced: boolean;
  /** the filter is shown: it is on, nothing is forced and there is more than one thing to choose from */
  visible: boolean;
}

export interface ResolvedProjectView {
  sort: Resolved<ProjectSort>;
  filters: ProjectFilters;
  groups: Record<FilterGroup, ResolvedGroup>;
  search: { visible: boolean; value: string };
}

/** What the projects have, so the filters offer only what exists: ids of skills, platforms, kinds and statuses. */
export interface Available {
  tech: string[];
  platform: Platform[];
  kind: Kind[];
  status: ProjectStatus[];
}

export const availableOf = (
  projects: Project[],
  skills?: Skills,
): Available => {
  const has = (group: FilterGroup) =>
    new Set(projects.flatMap((p) => valuesOf(p, group, skills)));
  const tech = has('tech');
  const platform = has('platform');
  const kind = has('kind');
  const status = has('status');
  return {
    tech: [...tech],
    platform: PLATFORMS.filter((v) => platform.has(v)),
    kind: PROJECT_KINDS.filter((v) => kind.has(v)),
    status: PROJECT_STATUSES.filter((v) => status.has(v)),
  };
};

/**
 * What shows, by the order of the skin, the theme and the language (`lib/preference/preference.ts`): what the owner forces, the address (a link
 * can be sent to another), the visitor's last choice, then the owner's default. A value the owner has left out (`off`) or that the projects do
 * not have is skipped wherever it comes from. The technologies are not checked against the projects, so a link made before a skill was
 * renamed still shows its list, and an id that matches nothing shows an empty list with "Clear filters".
 */
export function resolveProjectView({
  config,
  available,
  url = {},
  saved = {},
  fallbackSort,
}: {
  config: ProjectsConfig;
  available: Available;
  url?: RawView;
  saved?: RawView;
  /** the order a skin opens in when the owner has not said (Travel starts with the featured ones); the owner's `default` and `force` come first */
  fallbackSort?: ProjectSort;
}): ResolvedProjectView {
  const sort = resolvePreference<ProjectSort>({
    all: PROJECT_SORTS,
    keep: 'manual',
    remote: {
      ...config.sort,
      default: config.sort.default ?? fallbackSort,
    },
    url: url.sort,
    saved: saved.sort,
  });

  const groups = {} as Record<FilterGroup, ResolvedGroup>;
  for (const group of FILTER_GROUPS) {
    const setting = config.filters[group];
    const off: string[] = setting.off;
    const offered: string[] = available[group];
    const options = offered.filter((value) => !off.includes(value));
    // the technologies are open: any id counts unless the owner left it out
    const allowed = (value: string) =>
      group === 'tech' ? !off.includes(value) : options.includes(value);
    const forcedValues = setting.force.filter(allowed);
    const forced = forcedValues.length > 0;
    const chosen = setting.enabled
      ? ([url[group], saved[group], setting.default].find(
          (list) => list !== undefined,
        ) ?? [])
      : [];
    groups[group] = {
      values: forced ? forcedValues : chosen.filter(allowed),
      options,
      forced,
      visible: setting.enabled && !forced && options.length > 1,
    };
  }

  const search = config.filters.search;
  const text = search.enabled
    ? (url.q ?? saved.q ?? search.default).trim()
    : '';

  return {
    sort,
    filters: {
      tech: groups.tech.values,
      platform: groups.platform.values as Platform[],
      kind: groups.kind.values as Kind[],
      status: groups.status.values as ProjectStatus[],
      text,
    },
    groups,
    search: { visible: search.enabled, value: text },
  };
}

// ---------------------------------------------------------------- the address

/** `?sort=latest&tech=angular,kotlin&platform=mobile&kind=personal&status=ongoing&q=text` read as a choice. A group with no value (`&kind=`) was cleared. */
export const parseProjectQuery = (search: string): RawView => {
  const params = new URLSearchParams(search);
  const list = (key: string): string[] | undefined =>
    params.has(key)
      ? (params.get(key) ?? '').split(',').filter(Boolean)
      : undefined;
  const raw: RawView = {};
  const sort = params.get('sort');
  if (sort !== null) raw.sort = sort;
  for (const group of FILTER_GROUPS) {
    const values = list(group);
    if (values !== undefined) raw[group] = values;
  }
  const q = params.get('q');
  if (q !== null) raw.q = q;
  return raw;
};

const sameList = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((value) => b.includes(value));

/**
 * The address for a choice: `search` (the current one) with the keys of this page set to what differs from the owner's `defaults`, and
 * taken away when it does not, so a page that shows the defaults has a clean address. Other keys (`?skin=`) stay as they are.
 */
export const projectQueryString = (
  search: string,
  view: Pick<ResolvedProjectView, 'sort' | 'filters'>,
  defaults: Pick<ResolvedProjectView, 'sort' | 'filters'>,
): string => {
  const params = new URLSearchParams(search);
  if (view.sort.value === defaults.sort.value) params.delete('sort');
  else params.set('sort', view.sort.value);
  for (const group of FILTER_GROUPS) {
    if (sameList(view.filters[group], defaults.filters[group]))
      params.delete(group);
    else params.set(group, view.filters[group].join(','));
  }
  if (view.filters.text.trim() === defaults.filters.text.trim())
    params.delete('q');
  else params.set('q', view.filters.text.trim());
  const text = params.toString();
  return text ? `?${text}` : '';
};

/** The choice kept in the browser, read back; what is not what it should be counts for nothing. */
export const parseSavedView = (json: string | null): RawView => {
  if (!json) return {};
  try {
    const data: unknown = JSON.parse(json);
    if (typeof data !== 'object' || data === null) return {};
    const record = data as Record<string, unknown>;
    const raw: RawView = {};
    if (typeof record.sort === 'string') raw.sort = record.sort;
    for (const group of FILTER_GROUPS) {
      const value = record[group];
      if (Array.isArray(value))
        raw[group] = value.filter((v): v is string => typeof v === 'string');
    }
    if (typeof record.q === 'string') raw.q = record.q;
    return raw;
  } catch {
    return {};
  }
};
