/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { X } from 'lucide-react';
import { phoneProjectsCopy } from '@/content/copy/phone-projects';
import { projectsCopy } from '@/content/copy/projects';
import type { ProjectView } from '@/hooks/use-project-view';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { activeChoices } from '@/skins/phone/blocks/project-model';

/** The filters that are on, as chips under the buttons: one tap on a chip takes that filter away. */
export function ProjectsActiveFilters({
  view,
  className,
}: {
  view: ProjectView;
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  const own = useCopy(phoneProjectsCopy);
  const chips = activeChoices(view.groups, copy);
  if (chips.length === 0) return null;
  return (
    <div
      role='group'
      aria-label={own.activeFilters}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {chips.map(({ group, value, label }) => (
        <button
          key={`${group}:${value}`}
          type='button'
          aria-label={fill(own.removeFilter, { name: label })}
          onClick={() => view.groups[group].toggle(value)}
          className='inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-ph-accent/15 pr-2.5 pl-3.5 text-[14px] leading-none font-semibold text-ph-accent-ink transition-[scale,background-color] duration-100 select-none hover:bg-ph-accent/25 active:scale-[0.97] pointer-coarse:h-11'
        >
          {label}
          <X aria-hidden='true' className='size-4' strokeWidth={2.6} />
        </button>
      ))}
    </div>
  );
}
