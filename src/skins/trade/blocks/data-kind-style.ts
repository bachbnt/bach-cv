/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';

type Kind = Doc<'projects'>['kind'];

/** The dot of a kind in the legend, the rows and the cards. */
export const KIND_DOT: Record<Kind, string> = {
  personal: 'bg-tv-data-personal',
  freelance: 'bg-tv-data-freelance',
  company: 'bg-tv-data-company',
  academic: 'bg-tv-data-academic',
};

/** A heatmap tile of a kind: its colour mixed into the background, so the ink keeps its contrast in both themes. */
export const KIND_TILE: Record<Kind, string> = {
  personal:
    'border-tv-data-personal bg-[color-mix(in_srgb,var(--tv-data-personal)_30%,var(--tv-bg))]',
  freelance:
    'border-tv-data-freelance bg-[color-mix(in_srgb,var(--tv-data-freelance)_30%,var(--tv-bg))]',
  company:
    'border-tv-data-company bg-[color-mix(in_srgb,var(--tv-data-company)_30%,var(--tv-bg))]',
  academic:
    'border-tv-data-academic bg-[color-mix(in_srgb,var(--tv-data-academic)_30%,var(--tv-bg))]',
};
