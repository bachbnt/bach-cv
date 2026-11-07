/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { PageKey } from '@/lib/content/schema';

/** The pages in the order of the side navigation: the first group is the main list, the second sits under a divider. */
export const MAIN_PAGES = [
  'home',
  'projects',
  'resume',
  'about',
] as const satisfies readonly PageKey[];
export const MORE_PAGES = [
  'services',
  'payment',
  'certificates',
] as const satisfies readonly PageKey[];

/** How many pages the bottom navigation of a phone shows; the rest, and the settings, are in its "more" sheet. */
export const TAB_COUNT = 4;

/** From this width the sidebar is part of the layout (below it, a drawer) and the chat can sit beside the reel. */
export const WIDE_QUERY = '(min-width: 1100px)';

/** The pages in the order a visitor sees them. */
export function orderPages<T extends { page: PageKey }>(items: T[]): T[] {
  const order: readonly PageKey[] = [...MAIN_PAGES, ...MORE_PAGES];
  return [...items].sort(
    (a, b) => order.indexOf(a.page) - order.indexOf(b.page),
  );
}

/** The first pages become tabs of the bottom navigation, the others go to the "more" sheet. */
export function splitTabs<T>(items: T[]): { tabs: T[]; more: T[] } {
  return { tabs: items.slice(0, TAB_COUNT), more: items.slice(TAB_COUNT) };
}

/** A chapter's timestamp. Decoration: it only stands for the place of the step, 1:20 further for each one (`0:00`, `1:20`, `2:40`). */
export function chapterTime(index: number): string {
  const seconds = Math.max(0, Math.floor(index)) * 80;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/** The index after a step through the reel, wrapping around at both ends. A reel with nothing in it stays at 0. */
export function stepIndex(index: number, by: number, total: number): number {
  if (total <= 0) return 0;
  return (((index + by) % total) + total) % total;
}

/** A vertical swipe of the reel this many px or more changes the project. */
export const SWIPE_DISTANCE = 48;

/** Which way a finger moved: up (the next project), down (the previous one) or not far enough. */
export function swipeStep(startY: number, endY: number): -1 | 0 | 1 {
  const dy = endY - startY;
  if (Math.abs(dy) < SWIPE_DISTANCE) return 0;
  return dy < 0 ? 1 : -1;
}

/** A turn of the mouse wheel (or a swipe of two fingers on a trackpad) of this many px or more changes the project. */
export const WHEEL_DISTANCE = 24;
/** After a step the wheel is ignored this long, so one turn of a free-spinning wheel is one project and not five. */
export const WHEEL_COOLDOWN_MS = 600;

/** Which way the wheel turned: down (the next project), up (the previous one) or not far enough. Sideways turns are not a step. */
export function wheelStep(deltaY: number, deltaX = 0): -1 | 0 | 1 {
  if (Math.abs(deltaY) < WHEEL_DISTANCE || Math.abs(deltaX) > Math.abs(deltaY))
    return 0;
  return deltaY > 0 ? 1 : -1;
}
