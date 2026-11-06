/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useContentQuery } from '@/lib/query/use-content';
import { DevEducationCards } from '@/skins/dev/blocks/education-cards';
import { DevCardsSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevDataState } from '@/skins/dev/ui/dev-data-state';

/** Degrees, with the loading, empty and error states of every data block. */
export function DevEducationList() {
  const query = useContentQuery('education');
  const degrees = query.data ?? [];
  return (
    <DevDataState
      query={query}
      count={degrees.length}
      empty='education'
      subject='education'
      level={3}
      skeleton={<DevCardsSkeleton count={2} min={380} height={420} />}
    >
      <DevEducationCards degrees={degrees} />
    </DevDataState>
  );
}
