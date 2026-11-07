/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import type { CareerJob } from '@/lib/derive/skill-use';
import { STRIP_LIMIT } from '@/lib/derive/skill-strip';
import {
  pageItems,
  tapeItems,
  techItems,
} from '@/skins/trade/blocks/shell-tape';
import { navItems } from '@/skins/trade/config';

const now = new Date(2026, 10, 6);
const jobs: CareerJob[] = [
  {
    id: 'a',
    startMonth: '2023-11',
    endMonth: null,
    technologies: ['kotlin'],
    projects: [],
  },
];
const skill = (
  id: string,
  category: 'mobile' | 'web' | 'ai' | 'tools',
  listed = true,
) => ({ id, name: id, category, listed });

describe('techItems', () => {
  it('lists the listed skills mobile first, with the months they were in use', () => {
    const items = techItems(
      [
        skill('git', 'tools'),
        skill('kotlin', 'mobile'),
        skill('react', 'web'),
        skill('claude', 'ai'),
        skill('hidden', 'web', false),
      ],
      jobs,
      now,
    );
    expect(items.map((i) => i.label)).toEqual([
      'kotlin',
      'react',
      'claude',
      'git',
    ]);
    // Nov 2023 to Nov 2026, both months counted
    expect(items[0].months).toBe(37);
  });

  it('gives no number to a skill no role lists, instead of inventing one', () => {
    const [react] = techItems([skill('react', 'web')], jobs, now);
    expect(react.months).toBeNull();
  });

  it('stops at the same limit as the Standard strip', () => {
    const many = Array.from({ length: 30 }, (_, i) => skill(`s${i}`, 'web'));
    expect(techItems(many, jobs, now)).toHaveLength(STRIP_LIMIT);
  });
});

describe('pageItems and tapeItems', () => {
  it('skips a page that is coming soon or hidden and keeps the counts that are known', () => {
    const nav = navItems({
      home: 'on',
      about: 'on',
      resume: 'on',
      projects: 'on',
      certificates: 'hidden',
      services: 'soon',
      payment: 'on',
    });
    const pages = pageItems(nav, { projects: 9, resume: null });
    expect(pages.map((p) => p.page)).toEqual([
      'home',
      'projects',
      'resume',
      'about',
      'payment',
    ]);
    expect(pages.find((p) => p.page === 'projects')?.count).toBe(9);
    expect(pages.find((p) => p.page === 'resume')?.count).toBeNull();
    expect(pages.find((p) => p.page === 'about')?.count).toBeNull();
  });

  it('is the pages and then the technologies, with a key for each', () => {
    const items = tapeItems(
      pageItems(navItems({ home: 'on' } as never), {}),
      techItems([skill('kotlin', 'mobile')], jobs, now),
    );
    expect(items.at(-1)?.kind).toBe('tech');
    expect(new Set(items.map((i) => i.key)).size).toBe(items.length);
  });
});
