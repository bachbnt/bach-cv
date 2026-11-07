/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { SIDE_PROJECTS, type SkillEvidence } from '@/lib/derive/skill-use';

export interface EvidenceCopy {
  usedAt: string;
  separator: string;
  /** replaces the `Side projects` label of `skillEvidence` */
  sideProjects: string;
}

export interface TipCopy {
  usedAt: string;
  onlySide: string;
  andSide: string;
  /** with a `{year}` placeholder */
  firstUsed: string;
  none: string;
}

/** Card line: `Used at FPT · MoMo`. Empty when the skill has no evidence. */
export const evidenceLine = (
  evidence: SkillEvidence | undefined,
  copy: EvidenceCopy,
): string =>
  evidence?.usedAt.length
    ? `${copy.usedAt} ${evidence.usedAt
        .map((label) => (label === SIDE_PROJECTS ? copy.sideProjects : label))
        .join(copy.separator)}`
    : '';

/**
 * Tooltip sentence: `Used at FPT, MoMo and in side projects. First used 2022.`
 * Side projects are always last in `usedAt` and are phrased separately.
 */
export const tipText = (
  evidence: SkillEvidence | undefined,
  copy: TipCopy,
): string => {
  const usedAt = evidence?.usedAt ?? [];
  if (!usedAt.length) return copy.none;
  const places = usedAt.filter((label) => label !== SIDE_PROJECTS);
  const side = places.length < usedAt.length;
  const used = places.length
    ? `${copy.usedAt} ${places.join(', ')}${side ? ` ${copy.andSide}` : ''}.`
    : copy.onlySide;
  return evidence?.since
    ? `${used} ${copy.firstUsed.replace('{year}', String(evidence.since))}`
    : used;
};

export interface TipPlacement {
  left: number;
  top: number;
  /** horizontal offset of the arrow inside the tip */
  arrow: number;
  below: boolean;
}

/**
 * Centre the tip over its chip, keep it 8px inside the viewport, put it above the chip,
 * or below when there is no room above.
 */
export const placeTip = (
  chip: { left: number; top: number; width: number; bottom: number },
  tip: { width: number; height: number },
  viewportWidth: number,
): TipPlacement => {
  const centre = chip.left + chip.width / 2;
  const left = Math.max(
    8,
    Math.min(centre - tip.width / 2, viewportWidth - tip.width - 8),
  );
  const above = chip.top - tip.height - 10;
  const below = above < 8;
  return {
    left,
    top: below ? chip.bottom + 10 : above,
    arrow: Math.round(centre - left),
    below,
  };
};
