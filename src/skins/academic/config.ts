/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { PAGES, type Live, type PageKey } from '@/lib/content/schema';

/** The pages in the order of the tabs and of the page turns (the order of the site). */
export const ACADEMIC_PAGES: readonly PageKey[] = PAGES;

/** The page that lists the visitor can reach: a page switched off (`hidden`) is not on the board at all, one that is `soon` is. */
export function shownPages(live: Pick<Live, 'pages'>): PageKey[] {
  return ACADEMIC_PAGES.filter((page) => live.pages[page] !== 'hidden');
}

/** The page before and after `page` among the pages that are shown, for the page turns at the foot of a page. */
export function neighbours(
  page: PageKey,
  shown: readonly PageKey[],
): { previous: PageKey | null; next: PageKey | null; index: number } {
  const index = shown.indexOf(page);
  if (index < 0) return { previous: null, next: null, index: -1 };
  return {
    previous: shown[index - 1] ?? null,
    next: shown[index + 1] ?? null,
    index,
  };
}
