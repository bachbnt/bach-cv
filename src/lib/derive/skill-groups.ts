/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The listed skills grouped by area, and the areas that have skills.

import type { Doc } from '@/lib/content/schema';

/** The order of the areas on the skills list and in the heat map: AI first, as in the design. (The strip and the CV go mobile first: `skill-strip.ts`.) */
export const GROUP_ORDER = [
  'ai',
  'mobile',
  'web',
  'tools',
] as const satisfies readonly Doc<'skills'>['category'][];

/**
 * The listed skills grouped by area, in `GROUP_ORDER` unless another `order` is given (the watchlist and the strip go mobile first,
 * `STRIP_ORDER`); an area with no listed skill is left out. The filter is the same whatever the order, so every list shows the same skills.
 */
export function skillGroups<
  S extends Pick<Doc<'skills'>, 'category' | 'listed'>,
>(
  skills: S[],
  order: readonly S['category'][] = GROUP_ORDER,
): { category: S['category']; items: S[] }[] {
  return order
    .map((category) => ({
      category,
      items: skills.filter((s) => s.listed && s.category === category),
    }))
    .filter((group) => group.items.length);
}

/** The areas the key facts and the profile name, in the order of the page. `tools` is a way of working, not an area, so it is left out. */
export const AREAS = [
  'mobile',
  'web',
  'ai',
] as const satisfies readonly Doc<'skills'>['category'][];
export type Area = (typeof AREAS)[number];

/** The areas that have at least one listed skill, in the order of `AREAS`. */
export function areasWithSkills(
  skills: Pick<Doc<'skills'>, 'category' | 'listed'>[],
): Area[] {
  return AREAS.filter((area) =>
    skills.some((skill) => skill.listed && skill.category === area),
  );
}
