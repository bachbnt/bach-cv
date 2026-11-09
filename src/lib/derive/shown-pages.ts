/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// Which pages the visitor can reach, and which one comes before and after another.

import { PAGES, type Live, type PageKey } from '@/lib/content/schema';

type PageState = Live['pages'][PageKey];

/** A page is shown unless it is switched off (`hidden`); one that is `soon` is shown, but is not a link. */
export const isPageShown = (state: PageState): boolean => state !== 'hidden';

/** The pages that are shown, in `order` (the order of the site unless the caller lists them another way); a page switched off is left out. */
export function shownPages<K extends PageKey = PageKey>(
  pages: Live['pages'],
  order: readonly K[] = PAGES as readonly PageKey[] as readonly K[],
): K[] {
  return order.filter((page) => isPageShown(pages[page]));
}

/** The page before and after `page` among the pages that are shown, with its place in them (`-1` and no neighbours when it is not one of them). */
export function pageNeighbours(
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
