/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc, PageKey, Skill } from '@/lib/content/schema';
import { stripSkills } from '@/lib/derive/skill-strip';
import { monthsUsed, type CareerJob } from '@/lib/derive/skill-use';
import type { NavItem } from '@/skins/trade/config';

interface TechItem {
  key: string;
  kind: 'tech';
  label: string;
  category: Skill['category'];
  /** months in use across the roles that list it, `null` for a skill no role lists */
  months: number | null;
}

interface PageItem {
  key: string;
  kind: 'page';
  page: PageKey;
  /** a real number the page can state, or `null` */
  count: number | null;
}

export type TapeItem = TechItem | PageItem;

/** The listed skills of the Standard strip (mobile first, at most twenty), each with the months it was in use. Nothing is invented: a skill no role lists has no number. */
export function techItems(
  skills: Pick<Doc<'skills'>, 'id' | 'name' | 'category' | 'listed'>[],
  jobs: CareerJob[],
  now: Date,
): TechItem[] {
  return stripSkills(skills).map((skill) => {
    const months = monthsUsed(skill.id, jobs, now);
    return {
      key: `tech-${skill.id}`,
      kind: 'tech',
      label: skill.name,
      category: skill.category,
      months: months > 0 ? months : null,
    };
  });
}

/** The pages that can be opened (a page that is coming soon is not a link), each with its count when a page has read it. */
export function pageItems(
  nav: NavItem[],
  counts: Partial<Record<PageKey, number | null>>,
): PageItem[] {
  return nav
    .filter(({ soon }) => !soon)
    .map(({ page }) => ({
      key: `page-${page}`,
      kind: 'page',
      page,
      count: counts[page] ?? null,
    }));
}

/** A tape is the pages, then the technologies. */
export const tapeItems = (pages: PageItem[], techs: TechItem[]): TapeItem[] => [
  ...pages,
  ...techs,
];
