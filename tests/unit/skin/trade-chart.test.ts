/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RANGE,
  navItems,
  PHONE_NAV,
  RANGES,
  WATCH,
  WATCH_ORDER,
} from '@/skins/trade/config';
import { PAGES, liveSchema } from '@/lib/content/schema';

describe('config', () => {
  it('lists every page once, with its own ticker and route', () => {
    expect([...WATCH_ORDER].sort()).toEqual([...PAGES].sort());
    expect(new Set(Object.values(WATCH).map((w) => w.ticker)).size).toBe(7);
    expect(WATCH.home.href).toBe('/');
    expect(WATCH.projects.href).toBe('/projects');
  });

  it('leaves out a hidden page and marks a page that is coming soon', () => {
    const pages = {
      ...liveSchema.parse({}).pages,
      payment: 'hidden',
      about: 'soon',
    } as const;
    const items = navItems(pages);
    expect(items.map((i) => i.page)).not.toContain('payment');
    expect(items.find((i) => i.page === 'about')?.soon).toBe(true);
    expect(items.find((i) => i.page === 'home')?.soon).toBe(false);
    expect(items).toHaveLength(6);
  });

  it('has ranges that grow, ending with the whole career, and the bottom bar uses real pages', () => {
    const weeks = RANGES.map((r) => r.weeks);
    expect(weeks.at(-1)).toBeNull();
    const finite = weeks.slice(0, -1) as number[];
    expect([...finite].sort((a, b) => a - b)).toEqual(finite);
    expect(RANGES.map((r) => r.key)).toContain(DEFAULT_RANGE);
    for (const page of PHONE_NAV) expect(PAGES).toContain(page);
  });
});
