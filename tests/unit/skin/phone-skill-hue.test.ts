/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SKILL_CATEGORIES } from '@/lib/content/schema';
import { SKILL_HUES, skillHue } from '@/skins/phone/blocks/skill-hue';

const PALETTE = readFileSync('src/skins/phone/phone.css', 'utf8');
const THEME = readFileSync('src/app/tailwind-theme-phone.css', 'utf8');
const CHIP = readFileSync('src/skins/phone/ui/ph-chip.tsx', 'utf8');

describe('the hue of the chips of a skill', () => {
  it('gives every area of the skills a hue, always the same one', () => {
    for (const category of SKILL_CATEGORIES) {
      expect(skillHue(category), category).toBeDefined();
      expect(skillHue(category)).toBe(skillHue(category));
    }
  });

  it('tells the areas apart: no two areas share a hue', () => {
    const hues = SKILL_CATEGORIES.map((category) => skillHue(category));
    expect(new Set(hues).size).toBe(SKILL_CATEGORIES.length);
  });

  it('leaves an area it does not know, and a word of the prototype, neutral', () => {
    for (const unknown of [undefined, '', 'other', 'toString', '__proto__'])
      expect(skillHue(unknown), String(unknown)).toBeUndefined();
  });

  it('has a tint and a text for every hue in both themes, a colour utility for each and a class on the chip', () => {
    for (const hue of SKILL_HUES) {
      expect(
        PALETTE.match(new RegExp(`--ph-tag-${hue}-bg:`, 'g')),
      ).toHaveLength(2);
      expect(
        PALETTE.match(new RegExp(`--ph-tag-${hue}-ink:`, 'g')),
      ).toHaveLength(2);
      expect(THEME).toContain(`--color-ph-tag-${hue}: var(--ph-tag-${hue}-bg)`);
      expect(THEME).toContain(
        `--color-ph-tag-${hue}-ink: var(--ph-tag-${hue}-ink)`,
      );
      expect(CHIP).toContain(`bg-ph-tag-${hue} text-ph-tag-${hue}-ink`);
    }
  });
});
