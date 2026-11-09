/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';
import { GROUP_ORDER, skillGroups } from '@/lib/derive/skill-groups';
import {
  monthsUsed,
  type CareerJob,
  type SkillEvidence,
} from '@/lib/derive/skill-use';

/** What the skills table shows for a skill; the months and the places are the shared derivations, not worked out here. */
export interface SkillRow {
  skill: Doc<'skills'>;
  /** the months the roles that list the skill ran, overlaps counted once (`monthsUsed`) */
  months: number;
  evidence: SkillEvidence | undefined;
}

export type SortKey = 'area' | 'name' | 'months';
export type SortDir = 1 | -1;
export type AreaFilter = Doc<'skills'>['category'] | 'all';

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

/** The areas that have a row, in the order of the areas. */
export const areasOf = (rows: SkillRow[]): Doc<'skills'>['category'][] =>
  GROUP_ORDER.filter((area) => rows.some((row) => row.skill.category === area));

export const filterRows = (rows: SkillRow[], area: AreaFilter): SkillRow[] =>
  area === 'all' ? rows : rows.filter((row) => row.skill.category === area);

/**
 * The rows sorted by a column. The sort is stable: equal rows keep the order of Standard, and `area` is the order of the areas (so sorting by
 * area ascending is the Standard order).
 */
export function sortRows(
  rows: SkillRow[],
  key: SortKey,
  dir: SortDir,
  locale: string,
): SkillRow[] {
  const rank = (row: SkillRow) => GROUP_ORDER.indexOf(row.skill.category);
  const compare: Record<SortKey, (a: SkillRow, b: SkillRow) => number> = {
    area: (a, b) => rank(a) - rank(b),
    name: (a, b) => a.skill.name.localeCompare(b.skill.name, locale),
    months: (a, b) => a.months - b.months,
  };
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => compare[key](a.row, b.row) * dir || a.index - b.index)
    .map(({ row }) => row);
}
