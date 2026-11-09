/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { academicCopy } from '@/content/copy/academic';
import { PAGES, type Live } from '@/lib/content/schema';
import {
  ACADEMIC_PAGES,
  neighbours,
  shownPages,
} from '@/skins/academic/config';

const live = (pages: Partial<Live['pages']>): Pick<Live, 'pages'> => ({
  pages: {
    home: 'on',
    about: 'on',
    resume: 'on',
    projects: 'on',
    certificates: 'on',
    services: 'on',
    payment: 'on',
    ...pages,
  },
});

describe('the pages of the board', () => {
  it('are the pages of the site, in the order of the site', () => {
    expect([...ACADEMIC_PAGES]).toEqual([...PAGES]);
  });

  it('leave out a page that is switched off and keep one that is coming soon', () => {
    expect(shownPages(live({}))).toEqual([...PAGES]);
    expect(shownPages(live({ projects: 'hidden' }))).not.toContain('projects');
    expect(shownPages(live({ projects: 'soon' }))).toContain('projects');
  });

  it('turn to the page before and after, skipping the pages that are not there', () => {
    const shown = shownPages(live({ resume: 'hidden' }));
    expect(neighbours('about', shown)).toEqual({
      previous: 'home',
      next: 'projects',
      index: 1,
    });
    expect(neighbours('home', shown).previous).toBeNull();
    expect(neighbours('payment', shown).next).toBeNull();
  });

  it('have no neighbours for a page that is not shown', () => {
    expect(
      neighbours('resume', shownPages(live({ resume: 'hidden' }))),
    ).toEqual({
      previous: null,
      next: null,
      index: -1,
    });
  });
});

describe('the words of the board', () => {
  it('name the term of the manuscript of every page, in both languages', () => {
    for (const lang of ['en', 'vi'] as const)
      for (const page of PAGES)
        expect(academicCopy[lang].terms[page]).not.toBe('');
  });
});
