/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { DataResumeView } from '@/skins/trade/blocks/data-resume-view';
import { TvPage } from '@/skins/trade/ui/tv-page';

/** Resume in the Trade skin: the career as statements (years by roles, technologies by years, events), with the notes of each role, education and skills. */
export function ResumePage() {
  return (
    <TvPage page='resume'>
      <DataResumeView />
    </TvPage>
  );
}
