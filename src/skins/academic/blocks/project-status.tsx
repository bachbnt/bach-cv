/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { statusOf } from '@/lib/derive/project-view';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/**
 * Whether a project goes on or is done, as a rubber stamp pressed on the corner of its photo: red ink with a full dot and a solid frame while it
 * goes on, dark ink with a tick and a dashed frame once it is done, so the word and the shape say it and the colour only helps. The photo has to be
 * `relative`. The stamp is always the same size, so the corner does not change when a project ends.
 */
export function ProjectStatus({
  project,
  className,
}: {
  project: Pick<Doc<'projects'>, 'endMonth'>;
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  const status = statusOf(project);
  const ongoing = status === 'ongoing';
  return (
    <span
      data-slot='ac-status'
      data-status={status}
      className={cn(
        'pointer-events-none absolute top-3 left-1 inline-flex h-7 min-w-[7.25rem] -rotate-6 items-center justify-center gap-1.5 rounded-[6px_4px_7px_5px/5px_7px_4px_6px] border-2 bg-ac-polaroid px-2 font-ac-note text-[17px]/none whitespace-nowrap shadow-ac-photo-sm',
        ongoing
          ? 'border-ac-sheet-accent text-ac-sheet-accent'
          : 'border-dashed border-ac-sheet-ink text-ac-sheet-ink',
        className,
      )}
    >
      {ongoing ? (
        <span
          aria-hidden='true'
          className='mx-0.5 size-2.5 flex-none rounded-full bg-current'
        />
      ) : (
        <AcIcon name='check' className='size-3.5 flex-none' />
      )}
      {copy.statuses[status]}
    </span>
  );
}
