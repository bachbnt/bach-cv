/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Camera,
  CreditCard,
  Home,
  Route,
  Stamp,
  Ticket,
  UserRound,
} from 'lucide-react';
import type { Live, PageKey } from '@/lib/content/schema';
import type { MapFocus } from '@/skins/travel/map/types';

interface PageMeta {
  icon: LucideIcon;
  href: string;
}

/** Every page is a part of the trip: the icon of its tab and its route. */
export const PAGE_META: Record<PageKey, PageMeta> = {
  home: { icon: Home, href: '/' },
  resume: { icon: Route, href: '/resume' },
  projects: { icon: Camera, href: '/projects' },
  certificates: { icon: Stamp, href: '/certificates' },
  services: { icon: Ticket, href: '/services' },
  payment: { icon: CreditCard, href: '/payment' },
  about: { icon: UserRound, href: '/about' },
};

/** The order of the tabs (as the mock). */
export const NAV_ORDER = [
  'home',
  'resume',
  'projects',
  'certificates',
  'services',
  'payment',
  'about',
] as const satisfies readonly PageKey[];

export interface NavItem {
  page: PageKey;
  soon: boolean;
}

/** The pages the navigation shows: a hidden page is absent, a `soon` page is marked. */
export function navItems(pages: Live['pages']): NavItem[] {
  return NAV_ORDER.filter((page) => pages[page] !== 'hidden').map((page) => ({
    page,
    soon: pages[page] === 'soon',
  }));
}

/** The pages that are about the trip: the map shows the route, the pins and the traveller. */
export const ROUTE_PAGES: readonly (PageKey | null)[] = [
  'home',
  'resume',
  'about',
];

/** Where the camera looks on each page (real places): the trip itself, or an area that suits the metaphor. */
export const PAGE_FOCUS: Record<PageKey, MapFocus> = {
  home: { kind: 'overview' },
  resume: { kind: 'overview' },
  about: { kind: 'overview' },
  projects: { kind: 'place', lat: 12.232, lng: 109.222, zoom: 0.62 },
  certificates: { kind: 'place', lat: 12.2509, lng: 109.1961, zoom: 0.8 },
  services: { kind: 'place', lat: 12.2553, lng: 109.1941, zoom: 0.8 },
  payment: { kind: 'place', lat: 12.2028, lng: 109.2173, zoom: 0.8 },
};

/** The six colours a stop can have, in order (`--tl-stop-1`...). */
export const STOP_COLORS = 6;

/** Where the card of each page sits over the map (the pages choose it; the map aims at the part that stays free). */
export const PAGE_PANEL: Record<PageKey, 'left' | 'right' | 'wide'> = {
  home: 'left',
  about: 'left',
  resume: 'right',
  projects: 'wide',
  certificates: 'right',
  services: 'right',
  payment: 'right',
};
