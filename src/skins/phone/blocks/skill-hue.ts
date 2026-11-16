/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';

export const SKILL_HUES = ['blue', 'green', 'violet', 'amber'] as const;
export type SkillHue = (typeof SKILL_HUES)[number];

/**
 * The hue of the chips of an area (the `category` of a skill, which `skillGroups` groups by): the one place that says which. The tints are
 * `--ph-tag-*` in `phone.css`. An area this table does not know has no hue and its chips stay neutral, so a new area never gets a colour by accident.
 */
const HUE_OF = {
  mobile: 'blue',
  web: 'green',
  ai: 'violet',
  tools: 'amber',
} as const satisfies Record<Doc<'skills'>['category'], SkillHue>;

const BY_NAME: Readonly<Record<string, SkillHue>> = HUE_OF;

export function skillHue(category: string | undefined): SkillHue | undefined {
  return category !== undefined && Object.hasOwn(BY_NAME, category)
    ? BY_NAME[category]
    : undefined;
}
