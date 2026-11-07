/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The skills of the technology strip: order and limit.

import type { Doc } from '@/lib/content/schema';

/** Mobile first: the order of the technology strip and of the skills on the CV. */
export const STRIP_ORDER = ['mobile', 'web', 'ai', 'tools'] as const;

/** The strip shows at most this many technologies. */
export const STRIP_LIMIT = 20;

/** The skills the technology strip shows: the listed ones, grouped by area in `STRIP_ORDER`, at most `limit`. */
export function stripSkills<
  S extends Pick<Doc<'skills'>, 'category' | 'listed'>,
>(skills: S[], limit: number = STRIP_LIMIT): S[] {
  return STRIP_ORDER.flatMap((category) =>
    skills.filter((skill) => skill.listed && skill.category === category),
  ).slice(0, limit);
}
