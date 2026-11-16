/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { CircleCheck, CircleDot } from 'lucide-react';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { statusOf } from '@/lib/derive/project-view';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from 'cn';

/**
 * Whether a project goes on or is done: a pill like the kind and featured tags with a word and a glyph of its own shape (a dot in a ring,
 * a check), so colour is never the only sign. It is laid over a corner of the cover (it needs a `relative` parent), so it takes no room in
 * the card, and its width is the same in both states so the corner looks the same.
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
  const Glyph = status === 'ongoing' ? CircleDot : CircleCheck;
  return (
    <span
      data-slot='project-status'
      data-status={status}
      className={cn(
        'pointer-events-none absolute top-3 left-3 inline-flex min-w-28 items-center justify-center gap-1.5 rounded-full border bg-card px-2.5 py-[3px] text-[13px] font-semibold whitespace-nowrap text-foreground shadow-[0_2px_8px_rgba(27,31,39,.12)]',
        className,
      )}
    >
      <Glyph
        aria-hidden='true'
        className={cn(
          'size-3.5 flex-none',
          status === 'ongoing' ? 'text-brand-ink' : 'text-body',
        )}
        strokeWidth={2.4}
      />
      {copy.statuses[status]}
    </span>
  );
}
