/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Flag, Route, type LucideIcon } from 'lucide-react';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc, ProjectStatus } from '@/lib/content/schema';
import { statusOf } from '@/lib/derive/project-view';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/** The two signs of a status, on the postcards and in the filter: a route while the trip goes on, a flag once it has arrived. Decoration. */
export const STATUS_ICON: Record<ProjectStatus, LucideIcon> = {
  ongoing: Route,
  finished: Flag,
};

/**
 * Whether a project goes on or is done, as the stub of a boarding pass laid over the corner of its photo (the photo has to be `relative`): a
 * perforated edge, a route (teal) while the trip goes on, a flag (ink) once it has arrived, and the word, so colour is never alone. The width is the
 * same for both words, so the corner does not change when a project ends. `compact` is for a thumbnail.
 */
export function ProjectStatus({
  project,
  compact = false,
  className,
}: {
  project: Pick<Doc<'projects'>, 'endMonth'>;
  compact?: boolean;
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  const status = statusOf(project);
  const Icon = STATUS_ICON[status];
  return (
    <span
      data-slot='tl-status'
      data-status={status}
      className={cn(
        'pointer-events-none absolute inline-flex items-center justify-center whitespace-nowrap rounded-md border-l-[3px] border-dashed bg-tl-paper font-bold shadow-tl-tag',
        compact
          ? 'bottom-1 left-1 min-w-[5.5rem] gap-0.5 px-1 py-px text-[10px] leading-[1.3]'
          : 'top-2 left-2 min-w-[7.25rem] gap-1.5 px-2 py-1 text-[11.5px] leading-[1.2]',
        status === 'ongoing'
          ? 'border-tl-paper-tag-ink text-tl-paper-tag-ink'
          : 'border-tl-paper-ink text-tl-paper-ink',
        className,
      )}
    >
      <Icon
        aria-hidden='true'
        className={compact ? 'size-2.5 flex-none' : 'size-3.5 flex-none'}
        strokeWidth={2.4}
      />
      {copy.statuses[status]}
    </span>
  );
}
