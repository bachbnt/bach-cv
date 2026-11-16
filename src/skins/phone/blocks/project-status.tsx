/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { CircleCheck, CircleDot } from 'lucide-react';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { statusOf } from '@/lib/derive/project-view';
import { useCopy } from '@/lib/i18n/copy';
import { PhChip } from '@/skins/phone/ui/ph-chip';

/** Whether the project goes on or is done: a word and a glyph of its own shape as well as the colour. */
export function ProjectStatus({
  project,
}: {
  project: Pick<Doc<'projects'>, 'endMonth'>;
}) {
  const copy = useCopy(projectsCopy);
  const status = statusOf(project);
  const Glyph = status === 'ongoing' ? CircleDot : CircleCheck;
  return (
    <PhChip
      tone={status === 'ongoing' ? 'ok' : 'plain'}
      className='h-7 gap-1.5 text-[13px]'
    >
      <Glyph aria-hidden='true' className='size-3.5' strokeWidth={2.4} />
      {copy.statuses[status]}
    </PhChip>
  );
}
