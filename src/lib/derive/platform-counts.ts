/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// How many projects run on each platform.

import { PLATFORMS, type Platform, type Project } from '@/lib/content/schema';

/**
 * The platforms that at least one project runs on, in the order of `PLATFORMS`, each with its number of projects. A project that runs on
 * several platforms counts once for each, so the numbers add up to more than the number of projects; a platform with none is left out.
 */
export function platformCounts(
  projects: Pick<Project, 'platforms'>[],
): { platform: Platform; count: number }[] {
  return PLATFORMS.map((platform) => ({
    platform,
    count: projects.filter((project) => project.platforms.includes(platform))
      .length,
  })).filter(({ count }) => count > 0);
}
