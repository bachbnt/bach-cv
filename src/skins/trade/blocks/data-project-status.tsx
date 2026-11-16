/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check, Square } from 'lucide-react';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { statusOf } from '@/lib/derive/project-view';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { TvChip } from '@/skins/trade/ui/tv-chip';

/**
 * Whether a project goes on or is done, as the flag of a quote row: a filled square and the word on the green of "up" while it goes on, a check
 * on grey when it is done. The word is the copy's; the shape says it too, so the colour is never alone. Its width is the same for both words
 * (and both languages), so a row or a card does not change when a project ends.
 */
export function DataProjectStatus({
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
    <TvChip
      size='sm'
      tone={ongoing ? 'up' : 'neutral'}
      data-status={status}
      className={cn(
        'min-w-[6.75rem] justify-center gap-1 tracking-wide uppercase',
        className,
      )}
    >
      {ongoing ? (
        <Square aria-hidden='true' className='size-2 fill-current' />
      ) : (
        <Check aria-hidden='true' className='size-3' strokeWidth={3} />
      )}
      {copy.statuses[status]}
    </TvChip>
  );
}
