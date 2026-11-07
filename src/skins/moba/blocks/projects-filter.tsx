/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { MbButton } from '@/skins/moba/ui/mb-button';

export type KindFilter = 'all' | Doc<'projects'>['kind'];

/** The filter by kind: All and each kind that has a project, as pressed buttons in a group (a button is a real control, reachable with Tab). */
export function ProjectsFilter({
  kinds,
  value,
  onChange,
}: {
  kinds: Doc<'projects'>['kind'][];
  value: KindFilter;
  onChange: (value: KindFilter) => void;
}) {
  const copy = useCopy(projectsCopy);
  return (
    <div
      role='group'
      aria-label={copy.filterLabel}
      className='mb-5 flex flex-wrap gap-2'
    >
      {(['all', ...kinds] as const).map((kind) => (
        <MbButton
          key={kind}
          size='sm'
          variant={value === kind ? 'gold' : 'ghost'}
          aria-pressed={value === kind}
          onClick={() => onChange(kind)}
        >
          {kind === 'all' ? copy.filterAll : copy.kinds[kind]}
        </MbButton>
      ))}
    </div>
  );
}
