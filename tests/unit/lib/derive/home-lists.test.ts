/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  HOME_PROJECTS,
  HOME_ROLES,
  featuredProjects,
  latestRoles,
  projectHref,
} from '@/lib/derive/home-lists';

describe('latestRoles', () => {
  it('keeps the first roles in the order given, at most the number Home lists', () => {
    const jobs = Array.from({ length: 7 }, (_, i) => ({ id: `j${i}` }));
    expect(latestRoles(jobs).map((j) => j.id)).toEqual(
      jobs.slice(0, HOME_ROLES).map((j) => j.id),
    );
    expect(latestRoles(jobs.slice(0, 2))).toHaveLength(2);
    expect(latestRoles([])).toEqual([]);
  });
});

describe('featuredProjects', () => {
  const project = (id: string, highlight: number | null) => ({ id, highlight });

  it('takes the ranked projects in rank order and no more than Home shows', () => {
    const projects = [
      project('d', 4),
      project('x', null),
      project('b', 2),
      project('a', 1),
      project('c', 3),
    ];
    const featured = featuredProjects(projects);
    expect(featured).toHaveLength(HOME_PROJECTS);
    expect(featured.map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('is empty when nothing is ranked', () => {
    expect(featuredProjects([project('x', null)])).toEqual([]);
  });
});

describe('projectHref', () => {
  it('is the first link of the project, or the Projects page', () => {
    expect(
      projectHref({
        links: [{ url: 'https://a.dev' }, { url: 'https://b.dev' }],
      }),
    ).toBe('https://a.dev');
    expect(projectHref({ links: [] })).toBe('/projects');
  });
});
