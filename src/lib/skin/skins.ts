/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The looks (skins) of the site. */
export const SKIN_IDS = ['standard', 'dev', 'trade', 'moba'] as const;
export type SkinId = (typeof SKIN_IDS)[number];

/** The skin of the static HTML and of every visitor who has not chosen another. */
export const DEFAULT_SKIN: SkinId = 'standard';

/** localStorage key of the visitor's choice. */
export const SKIN_STORAGE_KEY = 'bach-cv-skin';

export const isSkinId = (value: unknown): value is SkinId =>
  SKIN_IDS.includes(value as SkinId);
