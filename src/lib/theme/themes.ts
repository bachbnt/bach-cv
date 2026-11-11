/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** What a visitor can choose: follow the system, or light, or dark. */
export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];
/** What shows. */
export type Scheme = 'light' | 'dark';
