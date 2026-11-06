/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { PAGES, type PageKey } from '@/lib/content/schema';

/** Each page has an accent and a soft tint (the design mockup). The header band and the page head use the tint. */
export const PAGE_META: Record<
  PageKey,
  { href: string; label: string; accent: string; tint: string }
> = {
  home: { href: '/', label: 'Home', accent: '#b3301f', tint: '#fbe2de' },
  about: { href: '/about', label: 'About', accent: '#a24100', tint: '#fde6d2' },
  resume: {
    href: '/resume',
    label: 'Resume',
    accent: '#7a5b00',
    tint: '#fbf1c4',
  },
  projects: {
    href: '/projects',
    label: 'Projects',
    accent: '#1a6b2d',
    tint: '#ddf2d9',
  },
  certificates: {
    href: '/certificates',
    label: 'Certificates',
    accent: '#1747b0',
    tint: '#dae8fb',
  },
  services: {
    href: '/services',
    label: 'Services',
    accent: '#3e3aa8',
    tint: '#e3e2fa',
  },
  payment: {
    href: '/payment',
    label: 'Payment',
    accent: '#7a2e9e',
    tint: '#f0e0f8',
  },
};

/** 404 and Coming soon use the neutral pair. */
export const NEUTRAL_THEME = { accent: '#b3301f', tint: '#e7e9ee' };

export const NAV_PAGES = PAGES.filter((page) => page !== 'home');

/** The page of a path (`/` is Home, `/about` is About), or `null` for a path that is not a page, such as the 404 screen. */
export function pageOfPath(pathname: string): PageKey | null {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return PAGES.find((page) => PAGE_META[page].href === clean) ?? null;
}
