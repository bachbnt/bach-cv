/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  experienceSchema,
  findBrokenRefs,
  liveSchema,
  localize,
  messageSchema,
  projectSchema,
  resolveItems,
  settingsSchema,
  shellSchema,
  skillSchema,
} from '@/lib/content/schema';

describe('fail-open defaults', () => {
  it('live parses from {}: every page and feature on, no maintenance', () => {
    const live = liveSchema.parse({});
    expect(Object.values(live.pages).every((state) => state === 'on')).toBe(
      true,
    );
    expect(Object.values(live.features).every(Boolean)).toBe(true);
    expect(live.maintenance.enabled).toBe(false);
  });

  it('shell and settings parse from {}', () => {
    expect(shellSchema.parse({}).defaultLanguage).toBe('en');
    expect(shellSchema.parse({}).alternateNames).toEqual([]);
    expect(settingsSchema.parse({}).chat.botName).toBe('BB Bot');
  });

  it('a skill defaults to the tools category', () => {
    expect(skillSchema.parse({}).category).toBe('tools');
  });
});

describe("projects: platforms and the owner's settings", () => {
  it('a project has no platform until it is given one, and a platform that does not exist is left out', () => {
    expect(projectSchema.parse({}).platforms).toEqual([]);
    expect(
      projectSchema.parse({ platforms: ['mobile', 'toaster', 4, 'web'] })
        .platforms,
    ).toEqual(['mobile', 'web']);
    expect(projectSchema.parse({ platforms: 'mobile' }).platforms).toEqual([]);
  });

  it('live has nothing fixed, nothing left out and every filter on for the Projects page', () => {
    const { projects } = liveSchema.parse({});
    expect(projects.sort).toEqual({ off: [] });
    for (const group of ['tech', 'platform', 'kind', 'status'] as const)
      expect(projects.filters[group]).toEqual({
        enabled: true,
        default: [],
        force: [],
        off: [],
      });
    expect(projects.filters.search).toEqual({ enabled: true, default: '' });
  });

  it('what is not one of the options is left out, so a slip in the console never breaks the page', () => {
    const { projects } = liveSchema.parse({
      projects: {
        sort: { default: 'sideways', force: 'name', off: ['latest', 'nope'] },
        filters: {
          platform: { default: ['mobile', 7, null], off: 'web' },
          tech: { force: ['angular'], enabled: false },
          search: { default: 5 },
        },
      },
    });
    expect(projects.sort.default).toBeUndefined();
    expect(projects.sort.force).toBe('name');
    expect(projects.sort.off).toEqual(['latest']);
    expect(projects.filters.platform.default).toEqual(['mobile']);
    expect(projects.filters.platform.off).toEqual([]);
    expect(projects.filters.tech).toMatchObject({
      enabled: false,
      force: ['angular'],
    });
  });
});

describe('experience', () => {
  it('rejects a bad month and defaults a missing endMonth to null (current role)', () => {
    expect(experienceSchema.safeParse({ startMonth: '2026-13' }).success).toBe(
      false,
    );
    expect(
      experienceSchema.parse({ startMonth: '2026-01' }).endMonth,
    ).toBeNull();
  });

  it('a partial translation keeps the English text for the other fields', () => {
    const e = experienceSchema.parse({
      startMonth: '2026-01',
      role: 'Lead',
      summary: 'EN',
      l10n: { vi: { role: 'Trưởng nhóm' } },
    });
    const vi = localize(e, 'vi');
    expect(vi.role).toBe('Trưởng nhóm');
    expect(vi.summary).toBe('EN');
  });

  it('drops a translation key that is not translatable', () => {
    const e = experienceSchema.parse({
      startMonth: '2026-01',
      l10n: { vi: { company: 'X' } },
    });
    expect(e.l10n.vi).not.toHaveProperty('company');
  });
});

describe('resolveItems', () => {
  const items = ['a', 'b', 'c', 'd'].map((id, i) => ({
    id,
    visible: id !== 'b',
    sort: (4 - i) * 10,
    highlight: id === 'c' ? 1 : null,
  }));

  it('drops hidden items and puts featured first', () => {
    expect(
      resolveItems(items, { featuredFirst: true }).map((x) => x.id),
    ).toEqual(['c', 'd', 'a']);
  });

  it('keeps sort order otherwise', () => {
    expect(resolveItems(items).map((x) => x.id)).toEqual(['d', 'c', 'a']);
  });
});

describe('references', () => {
  const none = { skills: [], education: [], projects: [], certificates: [] };

  it('flags a skill that does not exist', () => {
    const broken = findBrokenRefs({
      ...none,
      experience: [{ id: 'e', technologies: ['x'], projects: [] } as never],
    });
    expect(broken).toEqual(['experience/e.technologies -> skills/x']);
  });
});

describe('messageSchema', () => {
  it('needs a valid email and fills defaults', () => {
    expect(
      messageSchema.safeParse({ name: 'a', email: 'x', message: 'm' }).success,
    ).toBe(false);
    expect(
      messageSchema.parse({ name: 'a', email: 'a@b.co', message: 'm' }).locale,
    ).toBe('en');
  });
});

describe('maintenance switch', () => {
  it('is off by default and carries a per-language message', () => {
    const live = liveSchema.parse({});
    expect(live.maintenance).toEqual({ enabled: false, message: '', l10n: {} });
    const on = liveSchema.parse({
      maintenance: {
        enabled: true,
        message: 'EN',
        l10n: { vi: { message: 'VI' } },
      },
    });
    expect(localize(on.maintenance, 'vi').message).toBe('VI');
    expect(localize(on.maintenance, 'en').message).toBe('EN');
  });
});
