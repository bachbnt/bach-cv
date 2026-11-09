/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { PAGES, type Live } from '@/lib/content/schema';
import {
  isPageShown,
  pageNeighbours,
  shownPages,
} from '@/lib/derive/shown-pages';

const pages = (state: Partial<Live['pages']>): Live['pages'] => ({
  home: 'on',
  about: 'on',
  resume: 'on',
  projects: 'on',
  certificates: 'on',
  services: 'on',
  payment: 'on',
  ...state,
});

describe('isPageShown', () => {
  it('is false only for a page that is switched off', () => {
    expect(isPageShown('on')).toBe(true);
    expect(isPageShown('soon')).toBe(true);
    expect(isPageShown('hidden')).toBe(false);
  });
});

describe('shownPages', () => {
  it('is every page, in the order of the site, when none is switched off', () => {
    expect(shownPages(pages({}))).toEqual([...PAGES]);
  });

  it('leaves out a page that is switched off and keeps one that is coming soon', () => {
    expect(shownPages(pages({ projects: 'hidden' }))).not.toContain('projects');
    expect(shownPages(pages({ projects: 'soon' }))).toContain('projects');
  });

  it('follows the order the caller gives, and only lists those pages', () => {
    expect(
      shownPages(pages({ about: 'hidden' }), ['payment', 'about', 'home']),
    ).toEqual(['payment', 'home']);
  });
});

describe('pageNeighbours', () => {
  it('turns to the page before and after, skipping the pages that are not shown', () => {
    const shown = shownPages(pages({ resume: 'hidden' }));
    expect(pageNeighbours('about', shown)).toEqual({
      previous: 'home',
      next: 'projects',
      index: 1,
    });
    expect(pageNeighbours('home', shown).previous).toBeNull();
    expect(pageNeighbours('payment', shown).next).toBeNull();
  });

  it('has no neighbours for a page that is not shown', () => {
    expect(
      pageNeighbours('resume', shownPages(pages({ resume: 'hidden' }))),
    ).toEqual({ previous: null, next: null, index: -1 });
  });
});
