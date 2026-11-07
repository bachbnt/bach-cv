/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  advance,
  chapterKey,
  chaptersOf,
  DEFAULT_SPEED,
  inOrder,
  MAX_FRAME_MS,
  MIN_SHARE,
  nextSpeed,
  SCENE_MS,
  sceneOf,
  SPEEDS,
  timeLabel,
  yearAt,
  yearRange,
} from '@/skins/stream/blocks/career-chapters';

const NOW = new Date(2026, 10, 7);
const jobs = [
  { startMonth: '2026-01', endMonth: null },
  { startMonth: '2020-03', endMonth: '2022-04' },
  { startMonth: '2023-05', endMonth: '2023-12' },
  { startMonth: '2022-05', endMonth: '2026-01' },
];

describe('the order of the roles', () => {
  it('plays from the oldest to the newest', () => {
    expect(inOrder(jobs).map((j) => j.startMonth)).toEqual([
      '2020-03',
      '2022-05',
      '2023-05',
      '2026-01',
    ]);
  });

  it('puts a role that is still going after one that ended in the same month it began', () => {
    const same = [
      { startMonth: '2024-01', endMonth: null },
      { startMonth: '2024-01', endMonth: '2024-06' },
    ];
    expect(inOrder(same).map((j) => j.endMonth)).toEqual(['2024-06', null]);
  });

  it('does not change the list it is given', () => {
    const before = jobs.map((j) => j.startMonth);
    inOrder(jobs);
    expect(jobs.map((j) => j.startMonth)).toEqual(before);
  });
});

describe('the chapters of the bar', () => {
  const chapters = chaptersOf(inOrder(jobs), NOW);

  it('adds up to the whole bar, one after another', () => {
    expect(chapters.reduce((sum, c) => sum + c.share, 0)).toBeCloseTo(1, 10);
    chapters.forEach((c, i) => {
      expect(c.index).toBe(i);
      expect(c.offset).toBeCloseTo(
        chapters.slice(0, i).reduce((sum, x) => sum + x.share, 0),
        10,
      );
    });
  });

  it('makes a longer role wider', () => {
    // 2022-05 to 2026-01 (44 months) against 2020-03 to 2022-04 (25 months)
    expect(chapters[1].share).toBeGreaterThan(chapters[0].share);
  });

  it('never makes a role narrower than the floor, and marks only the role that is going', () => {
    const tiny = chaptersOf(
      [
        { startMonth: '2019-07', endMonth: '2019-09' },
        { startMonth: '2019-09', endMonth: '2026-09' },
        { startMonth: '2026-09', endMonth: null },
      ],
      NOW,
    );
    expect(tiny[0].share).toBeGreaterThanOrEqual(MIN_SHARE);
    expect(tiny.reduce((sum, c) => sum + c.share, 0)).toBeCloseTo(1, 10);
    expect(tiny.map((c) => c.current)).toEqual([false, false, true]);
  });

  it('carries the years, with the current year for the role that is going', () => {
    expect(chapters[0]).toMatchObject({ startYear: 2020, endYear: 2022 });
    expect(chapters[3]).toMatchObject({ startYear: 2026, endYear: 2026 });
  });

  it('is empty for no roles and whole for one', () => {
    expect(chaptersOf([], NOW)).toEqual([]);
    expect(chaptersOf([jobs[0]], NOW)[0].share).toBeCloseTo(1, 10);
  });

  it('keeps the floor reachable when there are many roles', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
      startMonth: `${2000 + i}-01`,
      endMonth: `${2000 + i}-02`,
    }));
    const shares = chaptersOf(many, NOW).map((c) => c.share);
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    expect(Math.min(...shares)).toBeGreaterThan(0);
  });
});

describe('the years of the time label', () => {
  const ordered = inOrder(jobs);

  it('gives the first and the last year of the career', () => {
    expect(yearRange(ordered, NOW)).toEqual({ from: 2020, to: 2026 });
    expect(yearRange([], NOW)).toEqual({ from: 2026, to: 2026 });
  });

  it('puts the playhead in the year of the scene, moving to the year it ends', () => {
    expect(yearAt(ordered, 0, NOW)).toBe(2020);
    expect(yearAt(ordered, 0.99, NOW)).toBe(2022);
    expect(yearAt(ordered, 1, NOW)).toBe(2022);
    expect(yearAt(ordered, 3.5, NOW)).toBe(2026);
    // the end of the career is the last year
    expect(yearAt(ordered, ordered.length, NOW)).toBe(2026);
  });

  it('writes the year over the years of the career', () => {
    expect(timeLabel(2022, 2020, 2026)).toBe('2022 / 2020–2026');
    expect(timeLabel(2026, 2026, 2026)).toBe('2026 / 2026');
  });
});

describe('the clock', () => {
  it('plays a scene in 4 seconds at the default 2x', () => {
    expect(DEFAULT_SPEED).toBe(2);
    let pos = 0;
    // 40 frames of 100 ms
    for (let i = 0; i < 40; i++)
      pos = advance(pos, MAX_FRAME_MS, DEFAULT_SPEED, 4).pos;
    expect(pos).toBeCloseTo((4000 * 2) / SCENE_MS, 10);
  });

  it('is slower at 1x and in between at 1.5x', () => {
    expect(advance(0, 100, 1, 4).pos).toBeLessThan(advance(0, 100, 1.5, 4).pos);
    expect(advance(0, 100, 1.5, 4).pos).toBeLessThan(advance(0, 100, 2, 4).pos);
  });

  it('counts a long frame (a tab that was asleep) as a short one', () => {
    expect(advance(0, 60_000, 2, 4).pos).toBe(
      advance(0, MAX_FRAME_MS, 2, 4).pos,
    );
    expect(advance(1, -50, 2, 4).pos).toBe(1);
  });

  it('stops on the last scene, full, at the end', () => {
    expect(advance(3.99, 100, 2, 4)).toEqual({ pos: 4, ended: true });
    expect(sceneOf(4, 4)).toBe(3);
  });

  it('finds the scene of a position and holds it inside the roles', () => {
    expect([0, 0.9, 1, 2.5, 99, -1].map((p) => sceneOf(p, 4))).toEqual([
      0, 0, 1, 2, 3, 0,
    ]);
    expect(sceneOf(3, 0)).toBe(0);
  });

  it('goes round 1x, 1.5x, 2x', () => {
    expect(SPEEDS).toEqual([1, 1.5, 2]);
    expect(nextSpeed(1)).toBe(1.5);
    expect(nextSpeed(1.5)).toBe(2);
    expect(nextSpeed(2)).toBe(1);
  });
});

describe('the keys of the chapters', () => {
  it('moves one chapter with the arrows, to the ends with Home and End, and stops at the ends', () => {
    expect(chapterKey('ArrowRight', 1, 4)).toBe(2);
    expect(chapterKey('ArrowDown', 3, 4)).toBe(3);
    expect(chapterKey('ArrowLeft', 1, 4)).toBe(0);
    expect(chapterKey('ArrowUp', 0, 4)).toBe(0);
    expect(chapterKey('Home', 2, 4)).toBe(0);
    expect(chapterKey('End', 0, 4)).toBe(3);
  });

  it('leaves the other keys alone', () => {
    expect(chapterKey('Enter', 1, 4)).toBeNull();
    expect(chapterKey('Tab', 1, 4)).toBeNull();
  });
});
