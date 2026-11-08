/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// What the Home page lists: the latest roles and the featured projects, and where a project card goes.

import { highlighted } from '@/lib/derive/highlighted';

/** How many roles Home lists. */
export const HOME_ROLES = 4;
/** How many featured projects Home shows. */
export const HOME_PROJECTS = 3;

/** The roles Home lists: the first ones of the list, which is already in display order (newest first). */
export const latestRoles = <T>(jobs: T[]): T[] => jobs.slice(0, HOME_ROLES);

/** The projects Home features: the ranked ones, in rank order, at most `HOME_PROJECTS`. */
export const featuredProjects = <T extends { highlight: number | null }>(
  projects: T[],
): T[] => highlighted(projects).slice(0, HOME_PROJECTS);

/** Where the card of a project goes: its first link, or the Projects page when it has none. */
export const projectHref = (project: { links: { url: string }[] }): string =>
  project.links[0]?.url ?? '/projects';
