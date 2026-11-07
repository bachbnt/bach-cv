/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc, PageKey } from '@/lib/content/schema';

export type SearchKind =
  | 'page'
  | 'project'
  | 'role'
  | 'skill'
  | 'certificate'
  | 'service'
  | 'education';

/** The groups of the results, in the order they are listed. */
export const KIND_ORDER: readonly SearchKind[] = [
  'page',
  'project',
  'role',
  'skill',
  'certificate',
  'service',
  'education',
];

/** Where a result goes: a route, or a job that Resume opens (`TradeProvider.showJob`). */
export type SearchTarget =
  { type: 'route'; href: string } | { type: 'job'; id: string };

export interface SearchItem {
  id: string;
  kind: SearchKind;
  title: string;
  /** one line under the title */
  detail: string;
  target: SearchTarget;
  /** the words the query is matched against (title, detail and what else describes the item), already normalised */
  haystack: string;
}

/** What the index is built from: the content as the hooks give it, and two functions of the visitor's language. */
export interface SearchSource {
  pages: { page: PageKey; label: string; href: string }[];
  projects: Pick<Doc<'projects'>, 'id' | 'name' | 'summary' | 'technologies'>[];
  jobs: Pick<
    Doc<'experience'>,
    | 'id'
    | 'company'
    | 'shortName'
    | 'role'
    | 'tagline'
    | 'startMonth'
    | 'endMonth'
    | 'technologies'
  >[];
  skills: Pick<Doc<'skills'>, 'id' | 'name' | 'category' | 'listed'>[];
  certificates: Pick<
    Doc<'certificates'>,
    'id' | 'name' | 'issuer' | 'issuedAt'
  >[];
  services: Pick<Doc<'services'>, 'id' | 'name' | 'description'>[];
  education: Pick<
    Doc<'education'>,
    'id' | 'degree' | 'school' | 'major' | 'startMonth' | 'endMonth'
  >[];
  period: (start: string, end: string | null) => string;
}

/** Lower case, without accents (Vietnamese included), so "ho so" finds "Hồ sơ". */
export const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();

const haystackOf = (...parts: (string | undefined)[]): string =>
  normalize(parts.filter(Boolean).join(' '));

/** One entry for everything a visitor could look for. A skill and a role go to Resume, a project to Projects, and so on. */
export function buildSearchIndex(source: SearchSource): SearchItem[] {
  const skillName = new Map(source.skills.map((s) => [s.id, s.name]));
  const namesOf = (ids: string[]) =>
    ids.map((id) => skillName.get(id)).filter((n): n is string => Boolean(n));
  const route = (href: string): SearchTarget => ({ type: 'route', href });
  return [
    ...source.pages.map((p): SearchItem => ({
      id: `page-${p.page}`,
      kind: 'page',
      title: p.label,
      detail: p.href,
      target: route(p.href),
      haystack: haystackOf(p.label, p.href),
    })),
    ...source.projects.map((p): SearchItem => ({
      id: `project-${p.id}`,
      kind: 'project',
      title: p.name,
      detail: p.summary,
      target: route('/projects'),
      haystack: haystackOf(p.name, p.summary, ...namesOf(p.technologies)),
    })),
    ...source.jobs.map((j): SearchItem => ({
      id: `role-${j.id}`,
      kind: 'role',
      title: `${j.role}, ${j.company}`,
      detail: source.period(j.startMonth, j.endMonth),
      target: { type: 'job', id: j.id },
      haystack: haystackOf(
        j.role,
        j.company,
        j.shortName,
        j.tagline,
        ...namesOf(j.technologies),
      ),
    })),
    ...source.skills
      .filter((s) => s.listed)
      .map((s): SearchItem => ({
        id: `skill-${s.id}`,
        kind: 'skill',
        title: s.name,
        detail: '',
        target: route('/resume#skills'),
        haystack: haystackOf(s.name, s.category),
      })),
    ...source.certificates.map((c): SearchItem => ({
      id: `certificate-${c.id}`,
      kind: 'certificate',
      title: c.name,
      detail: c.issuer,
      target: route('/certificates'),
      haystack: haystackOf(c.name, c.issuer, c.issuedAt.slice(0, 4)),
    })),
    ...source.services.map((s): SearchItem => ({
      id: `service-${s.id}`,
      kind: 'service',
      title: s.name,
      detail: s.description,
      target: route('/services'),
      haystack: haystackOf(s.name, s.description),
    })),
    ...source.education.map((e): SearchItem => ({
      id: `education-${e.id}`,
      kind: 'education',
      title: `${e.degree}, ${e.school}`,
      detail: source.period(e.startMonth, e.endMonth),
      target: route('/resume'),
      haystack: haystackOf(e.degree, e.school, e.major),
    })),
  ];
}

/** How well one word matches: the whole title, its start, the start of a word of it, anywhere in it, or only elsewhere in the item. */
function wordScore(title: string, item: SearchItem, word: string): number {
  if (title === word) return 100;
  if (title.startsWith(word)) return 60;
  if (title.includes(` ${word}`)) return 45;
  if (title.includes(word)) return 30;
  return item.haystack.includes(word) ? 10 : 0;
}

/** Every word of the query must match; the better the match, the earlier the item. Items of the same score keep their order. */
export function rankItems(
  items: SearchItem[],
  query: string,
  limit = Infinity,
): SearchItem[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return items
    .map((item, index) => {
      const title = normalize(item.title);
      const scores = words.map((word) => wordScore(title, item, word));
      return {
        item,
        index,
        score: scores.every((s) => s > 0) ? scores.reduce((a, b) => a + b) : 0,
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ item }) => item);
}

export interface SearchGroup {
  kind: SearchKind;
  items: SearchItem[];
}

/** Results grouped by kind in `KIND_ORDER`, at most `perGroup` in each; a kind with no result has no group. */
export function groupResults(items: SearchItem[], perGroup = 5): SearchGroup[] {
  return KIND_ORDER.map((kind) => ({
    kind,
    items: items.filter((item) => item.kind === kind).slice(0, perGroup),
  })).filter((group) => group.items.length > 0);
}
