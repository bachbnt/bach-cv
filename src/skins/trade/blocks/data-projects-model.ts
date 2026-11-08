/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { KIND_ORDER, skillsOf } from '@/components/projects/project-helpers';
import type { Doc } from '@/lib/content/schema';
import { foldText } from '@/lib/fold-text';

type Project = Doc<'projects'>;
type Skills = Map<string, Doc<'skills'>>;

/** The columns of the Projects screener, in the order of the grid. `name` is always shown. */
export const PROJECT_COLUMNS = [
  'name',
  'kind',
  'featured',
  'technologies',
  'screenshots',
  'links',
] as const;
export type ProjectColumn = (typeof PROJECT_COLUMNS)[number];

/** How tight the rows and cards of the Projects page are. */
export type Density = 'compact' | 'comfortable';

export type SortState = { column: ProjectColumn; dir: 'asc' | 'desc' } | null;

/** The order the grid opens in: the featured projects by rank, then the rest as they come. */
export const DEFAULT_SORT: SortState = { column: 'featured', dir: 'asc' };

export interface ProjectFilters {
  text: string;
  kind: Project['kind'] | 'all';
  featuredOnly: boolean;
  /** skill ids: a project must use all of them */
  technologies: string[];
}

export const NO_FILTERS: ProjectFilters = {
  text: '',
  kind: 'all',
  featuredOnly: false,
  technologies: [],
};

export const isFiltering = (filters: ProjectFilters): boolean =>
  filters.text.trim() !== '' ||
  filters.kind !== 'all' ||
  filters.featuredOnly ||
  filters.technologies.length > 0;

/** One click on a header: a new column starts ascending, the same one goes descending, then back to the default order. */
export const nextSort = (sort: SortState, column: ProjectColumn): SortState => {
  if (sort?.column !== column) return { column, dir: 'asc' };
  return sort.dir === 'asc' ? { column, dir: 'desc' } : null;
};

export const ariaSort = (
  sort: SortState,
  column: ProjectColumn,
): 'ascending' | 'descending' | 'none' =>
  sort?.column !== column
    ? 'none'
    : sort.dir === 'asc'
      ? 'ascending'
      : 'descending';

export const filterProjects = (
  projects: Project[],
  filters: ProjectFilters,
  skills: Skills,
): Project[] => {
  const words = foldText(filters.text).split(/\s+/).filter(Boolean);
  return projects.filter((project) => {
    if (filters.kind !== 'all' && project.kind !== filters.kind) return false;
    if (filters.featuredOnly && project.highlight === null) return false;
    if (!filters.technologies.every((id) => project.technologies.includes(id)))
      return false;
    if (words.length === 0) return true;
    const haystack = foldText(
      [
        project.name,
        project.summary,
        ...skillsOf(project.technologies, skills).map((s) => s.name),
      ].join(' '),
    );
    return words.every((word) => haystack.includes(word));
  });
};

const techCount = (project: Project, skills: Skills) =>
  skillsOf(project.technologies, skills).length;

/** The number a column sorts by (text columns are compared as text in `sortProjects`). */
const numberOf = (project: Project, column: ProjectColumn, skills: Skills) => {
  switch (column) {
    case 'kind':
      return KIND_ORDER.indexOf(project.kind);
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

/** A copy of `projects` in the order of `sort` (`null` keeps the order they came in). Ties keep that order; a project with no rank is always last. */
export const sortProjects = (
  projects: Project[],
  sort: SortState,
  skills: Skills,
): Project[] => {
  if (!sort) return projects;
  const sign = sort.dir === 'asc' ? 1 : -1;
  const indexed = projects.map((project, index) => ({ project, index }));
  indexed.sort((a, b) => {
    let diff: number;
    if (sort.column === 'name') {
      diff = sign * a.project.name.localeCompare(b.project.name);
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
    for (const skill of skillsOf(project.technologies, skills))
      counts.set(skill.id, (counts.get(skill.id) ?? 0) + 1);
  return [...counts]
    .map(([id, count]) => ({ id, name: skills.get(id)?.name ?? id, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

export const toggleId = <T extends string>(ids: T[], id: T): T[] =>
  ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];

/** The number the area of a heatmap tile stands for: how many technologies the project lists. */
export const heatValue = (project: Project, skills: Skills): number =>
  techCount(project, skills);
