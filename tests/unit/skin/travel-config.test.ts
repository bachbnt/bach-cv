/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { travelMapCopy } from '@/content/copy/travel-map';
import { travelShellCopy } from '@/content/copy/travel-shell';
import { travelTripCopy } from '@/content/copy/travel-trip';
import { PAGES, liveSchema } from '@/lib/content/schema';
import { SIGHT_IDS } from '@/skins/travel/map/sights';
import { SKIN_LOADERS } from '@/skins/registry';
import {
  NAV_ORDER,
  PAGE_FOCUS,
  PAGE_META,
  PAGE_PANEL,
  navItems,
} from '@/skins/travel/config';
import {
  clampCamera,
  minZoom,
  zoomAt,
  MAX_ZOOM,
} from '@/skins/travel/map/camera';
import { WORLD } from '@/skins/travel/map/iso';

describe('the pages of the trip', () => {
  it('has every page of the site once, with a route, a focus and a place for its card', () => {
    expect([...NAV_ORDER].sort()).toEqual([...PAGES].sort());
    for (const page of PAGES) {
      expect(PAGE_META[page].href.startsWith('/')).toBe(true);
      expect(PAGE_FOCUS[page]).toBeDefined();
      expect(PAGE_PANEL[page]).toBeDefined();
    }
  });

  it('leaves a hidden page out of the menu and marks a page that is coming soon', () => {
    const live = liveSchema.parse({
      pages: { payment: 'hidden', services: 'soon' },
    });
    const items = navItems(live.pages);
    expect(items.find((i) => i.page === 'payment')).toBeUndefined();
    expect(items.find((i) => i.page === 'services')?.soon).toBe(true);
    expect(items).toHaveLength(6);
  });

  it('is loaded lazily by the registry', () => {
    expect(typeof SKIN_LOADERS.travel).toBe('function');
  });
});

describe('the words of the skin', () => {
  it('names every sight in both languages, with a text', () => {
    for (const lang of ['en', 'vi'] as const)
      for (const id of SIGHT_IDS) {
        expect(travelMapCopy[lang].sights[id].name).not.toBe('');
        expect(travelMapCopy[lang].sights[id].text.length).toBeGreaterThan(20);
      }
  });

  it('gives the Vietnamese the same keys as the English', () => {
    const keys = (o: unknown): string[] =>
      o && typeof o === 'object'
        ? Object.entries(o).flatMap(([k, v]) => [k, ...keys(v)])
        : [];
    for (const copy of [travelMapCopy, travelShellCopy, travelTripCopy])
      expect(keys(copy.vi)).toEqual(keys(copy.en));
  });
});

describe('the camera', () => {
  const size = { w: 1200, h: 800 };

  it('never shows less than the map, nor zooms past the limit', () => {
    expect(minZoom(size)).toBeGreaterThanOrEqual(size.w / WORLD.width);
    expect(clampCamera({ cx: 0, cy: 0, z: 0.0001 }, size).z).toBe(
      minZoom(size),
    );
    expect(clampCamera({ cx: 0, cy: 0, z: 99 }, size).z).toBe(MAX_ZOOM);
  });

  it('keeps the view inside the world', () => {
    const c = clampCamera({ cx: -500, cy: 99999, z: 1 }, size);
    expect(c.cx).toBeGreaterThanOrEqual(size.w / 2);
    expect(c.cy).toBeLessThanOrEqual(WORLD.height - size.h / 2);
  });

  it('zooms about the point under the pointer', () => {
    const before = { cx: 3000, cy: 1800, z: 0.5 };
    const px = 900;
    const py = 300;
    const after = zoomAt(before, size, 1.5, px, py);
    const worldBefore = {
      x: before.cx + (px - size.w / 2) / before.z,
      y: before.cy + (py - size.h / 2) / before.z,
    };
    const worldAfter = {
      x: after.cx + (px - size.w / 2) / after.z,
      y: after.cy + (py - size.h / 2) / after.z,
    };
    expect(worldAfter.x).toBeCloseTo(worldBefore.x, 4);
    expect(worldAfter.y).toBeCloseTo(worldBefore.y, 4);
  });
});
