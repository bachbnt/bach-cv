/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { phoneProjectsCopy } from '@/content/copy/phone-projects';
import type { ProjectView } from '@/hooks/use-project-view';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { PhButton } from '@/skins/phone/ui/ph-button';

/** The foot of the filters: take them all away, or close the sheet with how many projects they leave (the list behind has already followed). */
export function ProjectsFilterFooter({
  view,
  onDone,
}: {
  view: ProjectView;
  onDone: () => void;
}) {
  const own = useCopy(phoneProjectsCopy);
  const count = view.shown.length;
  return (
    <div className='sticky bottom-0 flex items-center gap-3 border-t border-ph-line bg-inherit px-5 py-3'>
      <PhButton
        variant='ghost'
        disabled={!view.clearable}
        onClick={view.clear}
        className='shrink-0'
      >
        {own.clearAll}
      </PhButton>
      <PhButton
        variant='solid'
        onClick={onDone}
        className='h-auto min-h-11 flex-1 py-2 text-center whitespace-normal'
      >
        {count === 0
          ? own.showNone
          : count === 1
            ? own.showOne
            : fill(own.showMany, { count })}
      </PhButton>
    </div>
  );
}
