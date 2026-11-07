/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';
import { monthsUsed, rolesUsing, type CareerJob } from '@/lib/derive/skill-use';
import { skillGroups } from '@/lib/derive/skill-groups';
import {
  layoutTreemap,
  type TreemapRect,
} from '@/skins/trade/blocks/data-treemap';

type Skill = Doc<'skills'>;
type Category = Skill['category'];

/** A tile is never smaller than this many months of area, so a skill of two months, or none, can still be read and pressed. */
export const MIN_TILE_MONTHS = 6;

/** Pixels of area for one month on the map: the smallest tile is about 56 by 56. */
export const PX2_PER_MONTH = 520;

export interface HeatTile {
  skill: Skill;
  /** the months the roles that list the skill ran, overlaps counted once: `monthsUsed`, the number of the watchlist */
  months: number;
  roles: string[];
  /** what the area stands for: the months, but at least `MIN_TILE_MONTHS` */
  value: number;
}

export interface HeatGroup {
  category: Category;
  tiles: HeatTile[];
  /** the area of the group, in units of `value` */
  total: number;
}

/**
 * One tile for each listed skill, grouped by area. The months and the roles are not derived again here: they come from `monthsUsed`
 * and `rolesUsing` of `shell-career.ts`, the functions behind the years used in the watchlist and the ticker, so the three always agree.
 */
export function skillHeat(
  skills: Skill[],
  jobs: (CareerJob & Pick<Doc<'experience'>, 'id'>)[],
  now: Date,
): HeatGroup[] {
  return skillGroups(skills).map(({ category, items }) => {
    const tiles = items
      .map((skill) => {
        const months = monthsUsed(skill.id, jobs, now);
        return {
          skill,
          months,
          roles: rolesUsing(skill.id, jobs).map((job) => job.id),
          value: Math.max(months, MIN_TILE_MONTHS),
        };
      })
      .sort(
        (a, b) =>
          b.months - a.months || a.skill.name.localeCompare(b.skill.name),
      );
    return {
      category,
      tiles,
      total: tiles.reduce((sum, tile) => sum + tile.value, 0),
    };
  });
}

/** The height a group needs at `width` pixels when every month has `scale` pixels of area. */
export const groupHeight = (
  group: HeatGroup,
  width: number,
  scale: number = PX2_PER_MONTH,
): number => (width > 0 ? Math.ceil((group.total * scale) / width) : 0);

export const layoutGroup = (
  group: HeatGroup,
  width: number,
  scale: number = PX2_PER_MONTH,
): TreemapRect[] =>
  layoutTreemap(
    group.tiles.map((tile) => ({ id: tile.skill.id, value: tile.value })),
    width,
    groupHeight(group, width, scale),
  );

/** The 1px each tile loses to the gap between tiles. */
const TILE_GAP = 2;

/** The least width or height of a tile: the size of a touch target. */
export const MIN_TILE_SIDE = 44;

/**
 * The area of a month, in pixels, for all the maps at once so that area means the same in every area: the base scale, made larger
 * in small steps until no tile of any map is thinner than `MIN_TILE_SIDE` at this `width` (a squarified map can leave a thin strip).
 */
export function fitScale(
  groups: HeatGroup[],
  width: number,
  minSide: number = MIN_TILE_SIDE,
): number {
  let scale = PX2_PER_MONTH;
  for (let step = 0; step < 16; step += 1) {
    const fits = groups.every((group) =>
      layoutGroup(group, width, scale).every(
        (r) => r.w >= minSide + TILE_GAP && r.h >= minSide + TILE_GAP,
      ),
    );
    if (fits) return scale;
    scale *= 1.12;
  }
  return scale;
}

export type TileKey =
  'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Home' | 'End';

/**
 * Which tile the arrow keys move to, from the boxes of all the tiles in reading order: left and right step along that order, up and
 * down go to the tile whose centre is nearest in the row above or below. Home and End go to the first and the last.
 */
export function nextTile(
  boxes: { left: number; top: number; width: number; height: number }[],
  from: number,
  key: TileKey,
): number {
  const last = boxes.length - 1;
  if (last < 0 || from < 0) return -1;
  if (key === 'Home') return 0;
  if (key === 'End') return last;
  if (key === 'ArrowLeft') return Math.max(0, from - 1);
  if (key === 'ArrowRight') return Math.min(last, from + 1);
  const at = boxes[from];
  const cx = at.left + at.width / 2;
  const cy = at.top + at.height / 2;
  const direction = key === 'ArrowDown' ? 1 : -1;
  let best = from;
  let bestScore = Infinity;
  boxes.forEach((box, index) => {
    const dy = (box.top + box.height / 2 - cy) * direction;
    if (index === from || dy <= at.height / 4) return;
    const dx = Math.abs(box.left + box.width / 2 - cx);
    const score = dy + dx * 2;
    if (score < bestScore) {
      bestScore = score;
      best = index;
    }
  });
  return best;
}
