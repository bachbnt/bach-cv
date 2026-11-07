/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Live, PageKey } from '@/lib/content/schema';

/** The colour of the round tile of a watchlist row (a theme colour of the skin: `bg-tv-<tile>`). */
export type Tile =
  'accent' | 'violet' | 'sky' | 'orange' | 'dim' | 'up' | 'gold';

interface WatchItem {
  /** the short code of the page, like a ticker. Decoration beside the real label, which stays the accessible name. */
  ticker: string;
  tile: Tile;
  href: string;
}

/** Every page is a "symbol" of the watchlist. */
export const WATCH: Record<PageKey, WatchItem> = {
  home: { ticker: 'HOME', tile: 'accent', href: '/' },
  about: { ticker: 'ABOUT', tile: 'orange', href: '/about' },
  resume: { ticker: 'RSM', tile: 'sky', href: '/resume' },
  projects: { ticker: 'PROJ', tile: 'violet', href: '/projects' },
  certificates: { ticker: 'CERT', tile: 'gold', href: '/certificates' },
  services: { ticker: 'SVC', tile: 'dim', href: '/services' },
  payment: { ticker: 'PAY', tile: 'up', href: '/payment' },
};

/** The order of the watchlist (as the mock lists them: Home, Projects, Resume, then the rest). */
export const WATCH_ORDER = [
  'home',
  'projects',
  'resume',
  'about',
  'services',
  'payment',
  'certificates',
] as const satisfies readonly PageKey[];

export interface NavItem {
  page: PageKey;
  soon: boolean;
}

/** The pages the navigation shows: a hidden page is absent, a `soon` page is marked. */
export function navItems(pages: Live['pages']): NavItem[] {
  return WATCH_ORDER.filter((page) => pages[page] !== 'hidden').map((page) => ({
    page,
    soon: pages[page] === 'soon',
  }));
}

/** The four items of the bottom navigation of a phone (the chart is Home). */
export const PHONE_NAV = [
  'home',
  'projects',
  'resume',
  'services',
] as const satisfies readonly PageKey[];

export type RangeKey = 'm3' | 'm6' | 'y1' | 'y3' | 'all';

/** The ranges of the chart: how many weekly candles each shows (`null` is every candle). */
export const RANGES: { key: RangeKey; weeks: number | null }[] = [
  { key: 'm3', weeks: 13 },
  { key: 'm6', weeks: 26 },
  { key: 'y1', weeks: 52 },
  { key: 'y3', weeks: 156 },
  { key: 'all', weeks: null },
];

export const DEFAULT_RANGE: RangeKey = 'all';

/** The seed of the pseudo-random candles: the same chart on every visit. */
export const CANDLE_SEED = 7;
