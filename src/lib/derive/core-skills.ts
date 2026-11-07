/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';

type SkillLike = Pick<Doc<'skills'>, 'listed' | 'highlight'>;

/** The skills that have a chip of their own (the others are only tags on roles and projects). */
export const listedSkills = <S extends SkillLike>(skills: S[]): S[] =>
  skills.filter((skill) => skill.listed);

/** The core stack: the listed skills marked `highlight`, in the order given (the query puts the featured ones first, by rank). */
export const coreSkills = <S extends SkillLike>(skills: S[]): S[] =>
  skills.filter((skill) => skill.listed && skill.highlight);
