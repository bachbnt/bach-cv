/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { statusOf } from '@/lib/derive/project-view';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DevIcon } from '@/skins/dev/icons/dev-icon';

/**
 * Whether a project goes on or is done, as a token of the editor: `status: ongoing` in mono, with a filled dot (green) or a check (grey)
 * before it, so the word and the shape say it and the colour only helps. It is laid over the top left corner of a cover (the cover has to
 * be `relative`; it is not inside the cover's button, so a reader gets it), and it is as wide as the longer of the two words, so it does not change when a project ends.
 */
export function DevStatus({
  project,
  className,
}: {
  project: Pick<Doc<'projects'>, 'endMonth'>;
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  const status = statusOf(project);
  const other = status === 'ongoing' ? 'finished' : 'ongoing';
  return (
    <span
      data-slot='dev-status'
      data-status={status}
      className={cn(
        'pointer-events-none absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-[4px] border border-line-2 bg-chrome px-2 py-0.5 font-code text-[12px] leading-[normal] font-semibold whitespace-nowrap lowercase',
        status === 'ongoing' ? 'text-signal' : 'text-mute',
        className,
      )}
    >
      <span
        aria-hidden='true'
        className='grid size-3 flex-none place-items-center'
      >
        {status === 'ongoing' ? (
          <span className='size-[7px] rounded-full bg-current' />
        ) : (
          <DevIcon name='check' className='size-3' />
        )}
      </span>
      {/* both words take the same place, one of them unseen, so the token is as wide as the longer one in whatever language */}
      <span className='inline-grid'>
        <span className='col-start-1 row-start-1'>
          {copy.filters.status}: {copy.statuses[status]}
        </span>
        <span aria-hidden='true' className='invisible col-start-1 row-start-1'>
          {copy.filters.status}: {copy.statuses[other]}
        </span>
      </span>
    </span>
  );
}
