/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { skinsCopy } from '@/content/copy/skins';
import { PAGES } from '@/lib/content/schema';
import { pageOfPath } from '@/lib/pages';
import { SKIN_SCRIPT } from '@/lib/skin/skin-script';
import {
  DEFAULT_SKIN,
  isSkinId,
  SKIN_IDS,
  SKIN_STORAGE_KEY,
} from '@/lib/skin/skins';
import { DEV_FILES, DEV_TREE, shownPath } from '@/skins/dev/config';
import { SKIN_LOADERS } from '@/skins/registry';

describe('the list of skins', () => {
  it('starts with the default skin and knows its ids', () => {
    expect(SKIN_IDS[0]).toBe(DEFAULT_SKIN);
    expect(isSkinId('dev')).toBe(true);
    expect(isSkinId('nonsense')).toBe(false);
    expect(isSkinId(null)).toBe(false);
  });

  it('has a loader for every skin except the default one', () => {
    const others = SKIN_IDS.filter((id) => id !== DEFAULT_SKIN);
    expect(Object.keys(SKIN_LOADERS).sort()).toEqual([...others].sort());
  });

  it('names every skin in both languages', () => {
    for (const lang of ['en', 'vi'] as const) {
      for (const id of SKIN_IDS) {
        expect(skinsCopy[lang].names[id].name).not.toBe('');
        expect(skinsCopy[lang].names[id].hint).not.toBe('');
      }
    }
  });

  it('names the Academic skin in Vietnamese by its meaning, not by the English word, and no skin name says "Giao diện"', () => {
    expect(skinsCopy.vi.names.academic.name).toBe('Học thuật');
    for (const id of SKIN_IDS)
      expect(skinsCopy.vi.names[id].name).not.toMatch(/giao diện/i);
  });
});

describe('the script in <head>', () => {
  it('reads the saved choice and `?skin=`, and only knows the ids of the skins', () => {
    expect(SKIN_SCRIPT).toContain(SKIN_STORAGE_KEY);
    expect(SKIN_SCRIPT).toContain(JSON.stringify(SKIN_IDS));
    expect(SKIN_SCRIPT).toContain("get('skin')");
    expect(SKIN_SCRIPT).toContain("setAttribute('data-skin'");
  });

  it('is plain ES5 text (it is inlined into the static HTML)', () => {
    expect(SKIN_SCRIPT).not.toMatch(/=>|\bconst\b|\blet\b|`/);
  });
});

describe('the page of a path', () => {
  it('finds a page with or without a trailing slash', () => {
    expect(pageOfPath('/')).toBe('home');
    expect(pageOfPath('/about')).toBe('about');
    expect(pageOfPath('/about/')).toBe('about');
  });

  it('is null for a path that is not a page', () => {
    expect(pageOfPath('/no-such-page')).toBeNull();
    expect(pageOfPath('/about/team')).toBeNull();
  });
});

describe('the files of the Dev skin', () => {
  it('has a file for every page, with its own name', () => {
    expect(Object.keys(DEV_FILES).sort()).toEqual([...PAGES].sort());
    const names = Object.values(DEV_FILES).map((file) => file.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('puts the file of every page in the Explorer tree', () => {
    const pages: string[] = [];
    const walk = (nodes: typeof DEV_TREE) => {
      for (const node of nodes) {
        if (node.type === 'page') pages.push(node.page);
        if (node.type === 'dir') walk(node.children);
      }
    };
    walk(DEV_TREE);
    expect(pages.sort()).toEqual([...PAGES].sort());
  });

  it('shortens a long path in the command so it fits on one line', () => {
    expect(shownPath(DEV_FILES.projects)).toBe('backend/scripts/Projects.py');
    expect(shownPath(DEV_FILES.certificates)).toBe('…/bach/Certificates.kt');
    for (const file of Object.values(DEV_FILES)) {
      expect(shownPath(file).length).toBeLessThanOrEqual(34);
    }
  });
});
