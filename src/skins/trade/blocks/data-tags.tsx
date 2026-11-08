/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { TvChip } from '@/skins/trade/ui/tv-chip';

/** One technology as a small label, in the colour of its area. */
function DataTag({
  skill,
  className,
}: {
  skill: Doc<'skills'>;
  className?: string;
}) {
  return (
    <TvChip tone={skill.category} size='sm' className={className}>
      {skill.name}
    </TvChip>
  );
}

/** The technologies of a project. With a `limit` the rest is a "+3" label that names them, and the full list is in the project's details. */
export function DataTags({
  skills,
  limit,
  label,
  className,
}: {
  skills: Doc<'skills'>[];
  limit?: number;
  /** the accessible name of the list; "Technologies" when left out */
  label?: string;
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  const { projects } = useCopy(tradeDataCopy);
  if (skills.length === 0) return null;
  const shown = limit === undefined ? skills : skills.slice(0, limit);
  const rest = skills.slice(shown.length);
  return (
    <ul
      aria-label={label ?? copy.technologies}
      className={cn('m-0 flex list-none flex-wrap gap-1 p-0', className)}
    >
      {shown.map((skill) => (
        <li key={skill.id}>
          <DataTag skill={skill} />
        </li>
      ))}
      {rest.length > 0 && (
        <li title={rest.map((s) => s.name).join(', ')}>
          <TvChip size='sm'>
            {fill(projects.more, { count: rest.length })}
            <span className='sr-only'>
              : {rest.map((s) => s.name).join(', ')}
            </span>
          </TvChip>
        </li>
      )}
    </ul>
  );
}
