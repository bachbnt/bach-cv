/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  fitScale,
  groupHeight,
  layoutGroup,
  MIN_TILE_MONTHS,
  nextTile,
  skillHeat,
} from '@/skins/trade/blocks/data-skill-heat-model';
import { monthsUsed, rolesUsing } from '@/lib/derive/skill-use';
import { job, skill } from './trade-data-fixtures';

const now = new Date(2026, 10, 6);
const jobs = [
  job('c', '2026-01', null, { technologies: ['swift'] }),
  job('b', '2022-05', '2026-01', {
    technologies: ['swift', 'kotlin'],
    projects: [{ name: 'P', technologies: ['firebase'] }],
  }),
  job('a', '2020-03', '2022-04', { technologies: ['kotlin'] }),
];
const skills = [
  skill('swift', 'mobile'),
  skill('kotlin', 'mobile'),
  skill('firebase', 'tools'),
  skill('react', 'web'),
  skill('claude', 'ai'),
  { ...skill('hidden', 'web'), listed: false },
];

describe('skillHeat', () => {
  const groups = skillHeat(skills, jobs, now);
  const tile = (id: string) =>
    groups.flatMap((g) => g.tiles).find((t) => t.skill.id === id)!;

  it('takes the months and the roles from the derivation of the watchlist, for every skill', () => {
    for (const { skill: s, months, roles } of groups.flatMap((g) => g.tiles)) {
      expect(months).toBe(monthsUsed(s.id, jobs, now));
      expect(roles).toEqual(rolesUsing(s.id, jobs).map((j) => j.id));
    }
  });

  it('counts overlapping roles once, as that derivation does', () => {
    // swift: b (May 2022 - Jan 2026 = 45 months) and c (Jan 2026 - Nov 2026): Jan 2026 is in both
    expect(tile('swift').months).toBe(45 + 11 - 1);
    expect(tile('kotlin').months).toBe(26 + 45);
  });

  it('groups by area in the order of the skills list, leaves out unlisted skills and empty areas', () => {
    expect(groups.map((g) => g.category)).toEqual([
      'ai',
      'mobile',
      'web',
      'tools',
    ]);
    expect(
      groups.flatMap((g) => g.tiles).some((t) => t.skill.id === 'hidden'),
    ).toBe(false);
    expect(
      skillHeat([skill('x', 'web')], jobs, now).map((g) => g.category),
    ).toEqual(['web']);
  });

  it('shows a skill no role lists with zero months and the smallest tile', () => {
    expect(tile('react').months).toBe(0);
    expect(tile('react').roles).toEqual([]);
    expect(tile('react').value).toBe(MIN_TILE_MONTHS);
    expect(tile('firebase').months).toBe(45);
  });

  it('orders a group by months, the most used first', () => {
    expect(
      groups.find((g) => g.category === 'mobile')!.tiles.map((t) => t.skill.id),
    ).toEqual(['kotlin', 'swift']);
  });
});

describe('layoutGroup', () => {
  const many = skillHeat(
    Array.from({ length: 24 }, (_, i) => skill(`s${i}`, 'mobile')).map(
      (s, i) => ({
        ...s,
        // alternate the roles so months differ
        id: i % 3 === 0 ? 'swift' : i % 3 === 1 ? 'kotlin' : `s${i}`,
      }),
    ),
    jobs,
    now,
  )[0];

  it('gives each month the same area on every width, so area follows the months', () => {
    for (const width of [358, 700, 1000]) {
      const rects = layoutGroup(many, width);
      const height = groupHeight(many, width);
      rects.forEach((r) => {
        const value = many.tiles.find((t) => t.skill.id === r.id)!.value;
        expect((r.w * r.h) / value).toBeCloseTo(
          (width * height) / many.total,
          4,
        );
      });
    }
  });

  it('keeps even the smallest tile at least 44 px wide and tall at a phone width', () => {
    const real = skillHeat(
      Array.from({ length: 14 }, (_, i) => skill(`m${i}`, 'mobile')),
      [
        job('x', '2020-01', null, {
          technologies: Array.from({ length: 14 }, (_, i) => `m${i}`),
        }),
      ],
      now,
    )[0];
    for (const width of [326, 358, 520, 1000])
      for (const r of layoutGroup(real, width)) {
        expect(r.w).toBeGreaterThanOrEqual(44);
        expect(r.h).toBeGreaterThanOrEqual(44);
      }
  });

  it('has no height without a width', () => {
    expect(groupHeight(many, 0)).toBe(0);
    expect(layoutGroup(many, 0)).toEqual([]);
  });
});

describe('fitScale', () => {
  const group = (values: number[]) => ({
    category: 'mobile' as const,
    total: values.reduce((a, b) => a + b, 0),
    tiles: values.map((value, i) => ({
      skill: skill(`k${i}`, 'mobile'),
      months: value,
      roles: [],
      value,
    })),
  });
  // one big skill and many small ones leave thin strips at the base scale
  const uneven = group([60, 55, 46, 40, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]);

  it('makes every tile at least 44 px on both sides, on a phone and on a wide panel', () => {
    for (const width of [326, 358, 520, 1000]) {
      const scale = fitScale([uneven], width);
      for (const r of layoutGroup(uneven, width, scale)) {
        expect(r.w).toBeGreaterThanOrEqual(43.5);
        expect(r.h).toBeGreaterThanOrEqual(43.5);
      }
    }
  });

  it('keeps one scale for all the maps, so area means the same everywhere', () => {
    const other = group([30, 6, 6]);
    const scale = fitScale([uneven, other], 358);
    for (const g of [uneven, other])
      for (const r of layoutGroup(g, 358, scale)) {
        const value = g.tiles.find((t) => t.skill.id === r.id)!.value;
        expect((r.w * r.h) / value).toBeCloseTo(
          (358 * groupHeight(g, 358, scale)) / g.total,
          3,
        );
      }
  });

  it('does not grow what already fits', () => {
    expect(fitScale([group([10, 10, 10, 10])], 100)).toBe(520);
  });
});

describe('nextTile', () => {
  // two rows of two tiles, then a wide one
  const boxes = [
    { left: 0, top: 0, width: 100, height: 50 },
    { left: 100, top: 0, width: 100, height: 50 },
    { left: 0, top: 50, width: 60, height: 50 },
    { left: 60, top: 50, width: 140, height: 50 },
    { left: 0, top: 100, width: 200, height: 50 },
  ];

  it('steps along the reading order with left and right, and stops at the ends', () => {
    expect(nextTile(boxes, 1, 'ArrowRight')).toBe(2);
    expect(nextTile(boxes, 4, 'ArrowRight')).toBe(4);
    expect(nextTile(boxes, 0, 'ArrowLeft')).toBe(0);
    expect(nextTile(boxes, 3, 'ArrowLeft')).toBe(2);
  });

  it('goes to the tile nearest above or below with up and down', () => {
    expect(nextTile(boxes, 1, 'ArrowDown')).toBe(3);
    expect(nextTile(boxes, 0, 'ArrowDown')).toBe(2);
    expect(nextTile(boxes, 3, 'ArrowDown')).toBe(4);
    expect(nextTile(boxes, 3, 'ArrowUp')).toBe(1);
    expect(nextTile(boxes, 0, 'ArrowUp')).toBe(0);
  });

  it('goes to the first and last with Home and End', () => {
    expect(nextTile(boxes, 2, 'Home')).toBe(0);
    expect(nextTile(boxes, 2, 'End')).toBe(4);
    expect(nextTile([], 0, 'End')).toBe(-1);
  });
});
