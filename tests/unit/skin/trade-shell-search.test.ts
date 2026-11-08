/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  buildSearchIndex,
  groupResults,
  rankItems,
  type SearchSource,
} from '@/skins/trade/blocks/shell-search';

const source: SearchSource = {
  pages: [
    { page: 'home', label: 'Home', href: '/' },
    { page: 'projects', label: 'Projects', href: '/projects' },
    { page: 'resume', label: 'Hồ sơ', href: '/resume' },
    { page: 'certificates', label: 'Certificates', href: '/certificates' },
    { page: 'services', label: 'Services', href: '/services' },
  ],
  projects: [
    {
      id: 'venus',
      name: 'VenusAI',
      summary: 'An assistant for travel',
      technologies: ['kotlin'],
    },
    {
      id: 'devpad',
      name: 'DevPad',
      summary: 'A notepad for developers',
      technologies: ['react'],
    },
  ],
  jobs: [
    {
      id: 'fpt',
      company: 'FPT Software',
      shortName: 'FPT',
      role: 'Team Lead',
      tagline: 'Leads mobile teams',
      startMonth: '2022-05',
      endMonth: null,
      technologies: ['kotlin'],
    },
  ],
  skills: [
    { id: 'kotlin', name: 'Kotlin', category: 'mobile', listed: true },
    { id: 'react', name: 'React', category: 'web', listed: true },
    { id: 'secret', name: 'Hidden skill', category: 'tools', listed: false },
  ],
  certificates: [
    {
      id: 'c1',
      name: 'Claude Certified',
      issuer: 'Anthropic',
      issuedAt: '2025-03-01',
    },
  ],
  services: [{ id: 's1', name: 'App Development', description: 'Mobile apps' }],
  education: [
    {
      id: 'e1',
      degree: 'Bachelor',
      school: 'HCMUT',
      major: 'Computer Science',
      startMonth: '2014-09',
      endMonth: '2018-06',
    },
  ],
  period: (start, end) => `${start} to ${end ?? 'now'}`,
};

const index = buildSearchIndex(source);

describe('buildSearchIndex', () => {
  it('has an entry for every kind of content and sends each to the right place', () => {
    const byId = new Map(index.map((item) => [item.id, item]));
    expect(byId.get('page-resume')?.target).toEqual({
      type: 'route',
      href: '/resume',
    });
    expect(byId.get('project-venus')?.target).toEqual({
      type: 'route',
      href: '/projects',
    });
    expect(byId.get('role-fpt')?.target).toEqual({ type: 'job', id: 'fpt' });
    expect(byId.get('skill-kotlin')?.target).toEqual({
      type: 'route',
      href: '/resume#skills',
    });
    expect(byId.get('certificate-c1')?.target).toEqual({
      type: 'route',
      href: '/certificates',
    });
    expect(byId.get('service-s1')?.target).toEqual({
      type: 'route',
      href: '/services',
    });
    expect(byId.get('education-e1')?.target).toEqual({
      type: 'route',
      href: '/resume',
    });
  });

  it('leaves out a skill that is not listed, and names a role by its title and company', () => {
    expect(index.find((item) => item.id === 'skill-secret')).toBeUndefined();
    expect(index.find((item) => item.id === 'role-fpt')).toMatchObject({
      title: 'Team Lead, FPT Software',
      detail: '2022-05 to now',
    });
  });
});

describe('results of a page that is hidden or coming soon', () => {
  const without = (...hidden: string[]) =>
    buildSearchIndex({
      ...source,
      pages: source.pages.filter((p) => !hidden.includes(p.page)),
    }).map((item) => item.id);

  it('are not offered: the page they would open is not a way in', () => {
    const ids = without('projects');
    expect(ids).not.toContain('project-venus');
    expect(ids).not.toContain('page-projects');
    expect(ids).toContain('service-s1');
    expect(without('certificates')).not.toContain('certificate-c1');
    expect(without('services')).not.toContain('service-s1');
  });

  it('take roles, skills and degrees with the Resume page, which is where they open', () => {
    const ids = without('resume');
    for (const gone of ['role-fpt', 'skill-kotlin', 'education-e1'])
      expect(ids).not.toContain(gone);
    expect(ids).toContain('project-venus');
  });

  it('leave only the open pages when every page is closed', () => {
    const ids = buildSearchIndex({ ...source, pages: [] });
    expect(ids).toEqual([]);
  });
});

describe('rankItems', () => {
  it('finds nothing for an empty query', () => {
    expect(rankItems(index, '   ')).toEqual([]);
  });

  it('puts a title that starts with the word before one that only contains it', () => {
    const ids = rankItems(index, 'dev').map((item) => item.id);
    expect(ids[0]).toBe('project-devpad');
    expect(ids).toContain('service-s1');
  });

  it('matches without accents and ignores case', () => {
    expect(rankItems(index, 'ho so').map((i) => i.id)).toEqual(['page-resume']);
    expect(rankItems(index, 'KOTLIN').map((i) => i.id)).toEqual([
      'skill-kotlin',
      'project-venus',
      'role-fpt',
    ]);
  });

  it('needs every word, found in the title, the detail or what describes the item', () => {
    expect(rankItems(index, 'fpt lead').map((i) => i.id)).toEqual(['role-fpt']);
    expect(rankItems(index, 'fpt cooking')).toEqual([]);
    // a project is found by the technology it lists
    expect(rankItems(index, 'react').map((i) => i.id)).toEqual([
      'skill-react',
      'project-devpad',
    ]);
  });

  it('finds a certificate by its year and an education by its major', () => {
    expect(rankItems(index, '2025').map((i) => i.id)).toEqual([
      'certificate-c1',
    ]);
    expect(rankItems(index, 'computer').map((i) => i.id)).toEqual([
      'education-e1',
    ]);
  });

  it('can be limited', () => {
    expect(rankItems(index, 'e', 3)).toHaveLength(3);
  });
});

describe('groupResults', () => {
  it('groups by kind in a fixed order and caps each group', () => {
    const groups = groupResults(rankItems(index, 'e'), 1);
    expect(groups.map((g) => g.kind)).toEqual([
      'page',
      'project',
      'role',
      'skill',
      'certificate',
      'service',
      'education',
    ]);
    expect(groups.every((g) => g.items.length === 1)).toBe(true);
  });

  it('has no group for a kind with no result', () => {
    expect(groupResults(rankItems(index, 'kotlin')).map((g) => g.kind)).toEqual(
      ['project', 'role', 'skill'],
    );
  });
});
