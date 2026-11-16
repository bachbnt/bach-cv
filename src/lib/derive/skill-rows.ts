/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// One row for each listed skill: the months it was in use and where it was used.

import type { Doc } from '@/lib/content/schema';
import { skillGroups } from '@/lib/derive/skill-groups';
import {
  monthsUsed,
  type CareerJob,
  type SkillEvidence,
} from '@/lib/derive/skill-use';

/** What a list of skills shows for a skill; the months and the places are the shared derivations, not worked out by the caller. */
export interface SkillRow {
  skill: Doc<'skills'>;
  /** the months the roles that list the skill ran, overlaps counted once (`monthsUsed`) */
  months: number;
  evidence: SkillEvidence | undefined;
}

/**
 * One row for each listed skill, in the order of the Skills section of Standard (by area, `skillGroups`, the order of the skills inside an
 * area kept).
 */
export function skillRows(
  skills: Doc<'skills'>[],
  jobs: CareerJob[],
  evidence: Map<string, SkillEvidence>,
  now: Date,
): SkillRow[] {
  return skillGroups(skills)
    .flatMap((group) => group.items)
    .map((skill) => ({
      skill,
      months: monthsUsed(skill.id, jobs, now),
      evidence: evidence.get(skill.id),
    }));
}
