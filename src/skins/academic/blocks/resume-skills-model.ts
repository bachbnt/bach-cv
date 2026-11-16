/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';
import { GROUP_ORDER } from '@/lib/derive/skill-groups';
import type { SkillRow } from '@/lib/derive/skill-rows';

export type SortKey = 'area' | 'name' | 'months';
export type SortDir = 1 | -1;
export type AreaFilter = Doc<'skills'>['category'] | 'all';

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
