/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  PostcardsStrip,
  PROJECTS_TITLE_ID,
} from '@/skins/travel/blocks/postcards-strip';
import { TlPage } from '@/skins/travel/ui/tl-page';
import { TlPanel } from '@/skins/travel/ui/tl-panel';

/** Projects: postcards from the sights I built, along the bottom of the map (a sheet on a phone). */
export function ProjectsPage() {
  return (
    <TlPage page='projects'>
      <TlPanel side='wide' labelledBy={PROJECTS_TITLE_ID}>
        <PostcardsStrip />
      </TlPanel>
    </TlPage>
  );
}
