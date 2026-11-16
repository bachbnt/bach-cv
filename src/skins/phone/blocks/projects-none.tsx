/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { SearchX } from 'lucide-react';
import { projectsCopy } from '@/content/copy/projects';
import type { ProjectView } from '@/hooks/use-project-view';
import { useCopy } from '@/lib/i18n/copy';
import { PhButton } from '@/skins/phone/ui/ph-button';

/** No project passes the filters: the Standard sentence, and the way back when the visitor can take a filter away. */
export function ProjectsNone({ view }: { view: ProjectView }) {
  const copy = useCopy(projectsCopy);
  return (
    <div
      role='status'
      className='flex flex-col items-center gap-3 rounded-ph-panel bg-ph-sheet-2 px-6 py-10 text-center shadow-ph-card'
    >
      <span
        aria-hidden='true'
        className='inline-grid size-14 place-items-center rounded-ph-inner bg-ph-sheet-3 text-ph-mute'
      >
        <SearchX className='size-7' strokeWidth={1.8} />
      </span>
      <p className='max-w-[28ch] text-[16px]/[1.5] text-ph-ink'>
        {copy.filters.none}
      </p>
      {view.clearable && (
        <PhButton variant='solid' onClick={view.clear}>
          {copy.filters.clear}
        </PhButton>
      )}
    </div>
  );
}
