/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The part of a role the career player needs to lay it out. `endMonth` is null for the role I am in now. */
export interface CareerSpanInput {
  startMonth: string;
  endMonth: string | null;
}

/** A chapter of the career: where it sits on the bar (`offset` and `share`, from 0 to 1) and its years. */
export interface Chapter {
  index: number;
  offset: number;
  share: number;
  startYear: number;
  /** the year it ended, or the current year for the role I am in now */
  endYear: number;
  current: boolean;
}

/** The narrowest a chapter may be on the bar, so a two-month role can still be pointed at. */
export const MIN_SHARE = 0.07;

/** How long a scene lasts at 1x, in milliseconds. At 2x (the default) a role is on screen for 4 seconds. */
export const SCENE_MS = 8000;
export const SPEEDS = [1, 1.5, 2] as const;
export type Speed = (typeof SPEEDS)[number];
export const DEFAULT_SPEED: Speed = 2;

/** A frame longer than this (a tab that was asleep) counts as this long, so the career never jumps ahead. */
export const MAX_FRAME_MS = 100;

/** Months since year 0, from 'YYYY-MM' or a date, so two of them can be subtracted. */
export const monthIndex = (ym: string): number =>
  Number(ym.slice(0, 4)) * 12 + Number(ym.slice(5, 7)) - 1;

export const monthOf = (now: Date): number =>
  now.getFullYear() * 12 + now.getMonth();

/** The roles from the oldest to the newest (the order they are played in). A role that began the same month and is still going comes last. */
export function inOrder<T extends CareerSpanInput>(jobs: readonly T[]): T[] {
  return [...jobs].sort(
    (a, b) =>
      monthIndex(a.startMonth) - monthIndex(b.startMonth) ||
      (a.endMonth ? monthIndex(a.endMonth) : Infinity) -
        (b.endMonth ? monthIndex(b.endMonth) : Infinity),
  );
}

/** Months a role lasted, up to `now` for the current one; never below 1 so every role has a width. */
export function monthsOf(job: CareerSpanInput, now: Date): number {
  const end = job.endMonth ? monthIndex(job.endMonth) : monthOf(now);
  return Math.max(1, end - monthIndex(job.startMonth));
}

/**
 * The chapters of the bar: one for each role in the order given, as wide as the role lasted, but none narrower than `MIN_SHARE`
 * (the others give up the room). The shares always add up to 1.
 */
export function chaptersOf(
  jobs: readonly CareerSpanInput[],
  now: Date,
): Chapter[] {
  if (!jobs.length) return [];
  const months = jobs.map((job) => monthsOf(job, now));
  const total = months.reduce((sum, m) => sum + m, 0);
  const floor = Math.min(MIN_SHARE, 0.5 / jobs.length);
  const raw = months.map((m) => m / total);
  const small = raw.filter((share) => share < floor).length;
  const rest = raw.reduce((sum, s) => (s < floor ? sum : sum + s), 0);
  const scale = rest > 0 ? (1 - small * floor) / rest : 1;
  const shares = raw.map((share) => (share < floor ? floor : share * scale));
  let offset = 0;
  return jobs.map((job, index) => {
    const share = shares[index];
    const chapter: Chapter = {
      index,
      offset,
      share,
      startYear: Math.floor(monthIndex(job.startMonth) / 12),
      endYear: Math.floor(
        (job.endMonth ? monthIndex(job.endMonth) : monthOf(now)) / 12,
      ),
      current: job.endMonth === null,
    };
    offset += share;
    return chapter;
  });
}

/** The first and the last year of the career, for the label next to the controls. */
export function yearRange(
  jobs: readonly CareerSpanInput[],
  now: Date,
): { from: number; to: number } {
  if (!jobs.length) return { from: now.getFullYear(), to: now.getFullYear() };
  const first = Math.min(...jobs.map((job) => monthIndex(job.startMonth)));
  const last = Math.max(
    ...jobs.map((job) =>
      job.endMonth ? monthIndex(job.endMonth) : monthOf(now),
    ),
  );
  return { from: Math.floor(first / 12), to: Math.floor(last / 12) };
}

/** The year the playhead is on: the year the scene begins, moving to the year it ends as the scene plays. `pos` is the scene number plus its progress. */
export function yearAt(
  jobs: readonly CareerSpanInput[],
  pos: number,
  now: Date,
): number {
  if (!jobs.length) return now.getFullYear();
  const index = sceneOf(pos, jobs.length);
  const job = jobs[index];
  const start = monthIndex(job.startMonth);
  const end = job.endMonth ? monthIndex(job.endMonth) : monthOf(now);
  const progress = Math.min(1, Math.max(0, pos - index));
  return Math.floor((start + (end - start) * progress) / 12);
}

/** The label of the time next to the controls: the year of the playhead over the years of the whole career. */
export function timeLabel(year: number, from: number, to: number): string {
  return `${year} / ${from === to ? from : `${from}–${to}`}`;
}

/** The scene a position falls in (the last one when the career has ended). */
export function sceneOf(pos: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.floor(pos)));
}

/** Moves the playhead by `deltaMs` at `speed`. At the end it stops on the last scene, full (the role I am in now), and says so. */
export function advance(
  pos: number,
  deltaMs: number,
  speed: number,
  count: number,
): { pos: number; ended: boolean } {
  const frame = Math.min(Math.max(0, deltaMs), MAX_FRAME_MS);
  const next = pos + (frame * speed) / SCENE_MS;
  return next >= count
    ? { pos: count, ended: true }
    : { pos: next, ended: false };
}

/** The speed after this one when the button is pressed: 1x, 1.5x, 2x, and round again. */
export function nextSpeed(speed: number): Speed {
  const at = SPEEDS.findIndex((s) => s === speed);
  return SPEEDS[(at + 1) % SPEEDS.length];
}

/** The label of a speed: `2x`, `1.5x`. */
export const speedLabel = (speed: number): string => `${speed}x`;

/** Arrow keys on the chapters: the chapter to go to, or null for any other key. Home and End go to the first and the last. */
export function chapterKey(
  key: string,
  index: number,
  count: number,
): number | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return Math.min(count - 1, index + 1);
    case 'ArrowLeft':
    case 'ArrowUp':
      return Math.max(0, index - 1);
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
