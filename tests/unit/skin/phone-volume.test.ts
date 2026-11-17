/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  HOLD_DELAY_MS,
  HOLD_EVERY_MS,
  MAX_VOLUME,
  repeatDelay,
  START_VOLUME,
  stepsHeld,
  stepVolume,
  volumeGlyph,
} from '@/skins/phone/shell/volume';

describe('the volume of the device', () => {
  it('starts in the middle of 15 steps', () => {
    expect(MAX_VOLUME).toBe(15);
    expect(START_VOLUME).toBe(8);
  });

  it('steps by one a press and stays in 0 to 15', () => {
    expect(stepVolume(8, 'up')).toEqual({ level: 9, atLimit: false });
    expect(stepVolume(8, 'down')).toEqual({ level: 7, atLimit: false });
    expect(stepVolume(14, 'up')).toEqual({ level: 15, atLimit: false });
    expect(stepVolume(1, 'down')).toEqual({ level: 0, atLimit: false });
    let level = START_VOLUME;
    for (let i = 0; i < 40; i++) level = stepVolume(level, 'up').level;
    expect(level).toBe(MAX_VOLUME);
    for (let i = 0; i < 40; i++) level = stepVolume(level, 'down').level;
    expect(level).toBe(0);
  });

  it('says it is at the end of its range when a press changes nothing, which is when the HUD shakes', () => {
    expect(stepVolume(15, 'up')).toEqual({ level: 15, atLimit: true });
    expect(stepVolume(0, 'down')).toEqual({ level: 0, atLimit: true });
    expect(stepVolume(15, 'down').atLimit).toBe(false);
    expect(stepVolume(0, 'up').atLimit).toBe(false);
  });

  it('draws a muted speaker at 0, one wave up to the middle and two above', () => {
    expect(volumeGlyph(0)).toBe('muted');
    expect(volumeGlyph(1)).toBe('low');
    expect(volumeGlyph(7)).toBe('low');
    expect(volumeGlyph(8)).toBe('high');
    expect(volumeGlyph(15)).toBe('high');
  });
});

describe('a held key', () => {
  it('waits 400 ms for the first repeat and then 150 ms for each', () => {
    expect(repeatDelay(0)).toBe(HOLD_DELAY_MS);
    expect(repeatDelay(1)).toBe(HOLD_EVERY_MS);
    expect(repeatDelay(9)).toBe(HOLD_EVERY_MS);
    expect(HOLD_DELAY_MS).toBe(400);
    expect(HOLD_EVERY_MS).toBe(150);
  });

  it('has made one step at the press, none more before 400 ms, then a step every 150 ms', () => {
    expect(stepsHeld(0)).toBe(1);
    expect(stepsHeld(399)).toBe(1);
    expect(stepsHeld(400)).toBe(2);
    expect(stepsHeld(549)).toBe(2);
    expect(stepsHeld(550)).toBe(3);
    expect(stepsHeld(400 + 150 * 10)).toBe(12);
  });

  it('agrees with the timer: the sum of the delays is the time of the step', () => {
    let at = 0;
    for (let repeats = 0; repeats < 8; repeats++) {
      at += repeatDelay(repeats);
      expect(stepsHeld(at)).toBe(2 + repeats);
    }
  });
});
