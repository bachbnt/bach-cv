/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { DataProjectsScreener } from '@/skins/trade/blocks/data-projects-screener';
import { TvPage } from '@/skins/trade/ui/tv-page';

/** Projects in the Trade skin: a screener (table, cards or heatmap) with filters, sortable columns and the Standard screenshots window. */
export function ProjectsPage() {
  return (
    <TvPage page='projects'>
      <DataProjectsScreener />
    </TvPage>
  );
}
