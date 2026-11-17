/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/*
 * The volume of the device: decoration with a visible effect (the HUD of `ph-volume-hud.tsx`). The site has no sound, so nothing real is changed.
 * The rules are pure, so they are tested without a page.
 */

/** the steps of the volume, 0 (muted) to 15, and where it starts */
export const MAX_VOLUME = 15;
export const START_VOLUME = 8;
/** how long the HUD stays after the last press, in ms */
export const HUD_MS = 1400;
/** a held key repeats: the first repeat comes after 400 ms and then one every 150 ms */
export const HOLD_DELAY_MS = 400;
export const HOLD_EVERY_MS = 150;

export type VolumeKey = 'up' | 'down';

/** The volume after a press of a key, kept in 0 to `MAX_VOLUME`, and whether the key was pressed at the end of its range (the HUD shakes then). */
export function stepVolume(
  level: number,
  key: VolumeKey,
): { level: number; atLimit: boolean } {
  const next = Math.min(
    MAX_VOLUME,
    Math.max(0, level + (key === 'up' ? 1 : -1)),
  );
  return { level: next, atLimit: next === level };
}

/** The glyph of the HUD: a speaker with a cross at 0, with one wave up to the middle of the range and with two above. */
export const volumeGlyph = (level: number): 'muted' | 'low' | 'high' =>
  level <= 0 ? 'muted' : level <= MAX_VOLUME / 2 ? 'low' : 'high';

/** How long to wait before the next repeat of a held key, given how many repeats have been made: 400 ms, then 150 ms. */
export const repeatDelay = (repeats: number): number =>
  repeats === 0 ? HOLD_DELAY_MS : HOLD_EVERY_MS;

/** How many steps a key held for `held` ms has made in all: the press itself, then a repeat at 400 ms and one every 150 ms after. */
export const stepsHeld = (held: number): number =>
  held < HOLD_DELAY_MS
    ? 1
    : 2 + Math.floor((held - HOLD_DELAY_MS) / HOLD_EVERY_MS);
