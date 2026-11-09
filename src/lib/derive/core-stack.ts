/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The skills of the core stack: the ones that are listed and have a rank, in rank order.

import { highlighted } from '@/lib/derive/highlighted';

/**
 * The core stack: the listed skills that carry a `highlight` rank (1 first), in rank order. A skill that is not listed is never part of it,
 * even with a rank. The order of equal ranks is kept.
 */
export function coreStack<
  T extends { listed: boolean; highlight: number | null },
>(skills: T[]): T[] {
  return highlighted(skills.filter((skill) => skill.listed));
}
