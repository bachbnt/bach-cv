/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowUpDown } from 'lucide-react';
import { projectsCopy } from '@/content/copy/projects';
import type { ProjectView } from '@/hooks/use-project-view';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { ProjectsActiveFilters } from '@/skins/phone/blocks/projects-active-filters';
import { ProjectsFilters } from '@/skins/phone/blocks/projects-filters';
import { ProjectsSearch } from '@/skins/phone/blocks/projects-search';
import { ProjectsSort } from '@/skins/phone/blocks/projects-sort';

/**
 * The bar over the list, the way a phone's app draws it: a line that says how many projects are left and in which order, with the way back; one row with the
 * search field and, at its end, two round buttons (the filters with how many are on, and the order); and the filters that are on as chips under it. What is on offer is the owner's (`site/live`, `projects`) and `useProjectView`'s; this only draws it.
 */
export function ProjectsToolbar({ view }: { view: ProjectView }) {
  const copy = useCopy(projectsCopy);
  const { groups, sort, search } = view;
  const anyFilter = Object.values(groups).some((group) => group.visible);
  if (!anyFilter && !sort.visible && !search.visible) return null;

  return (
    <div data-projects-part='toolbar'>
      {/* over the buttons, so the popover of a tablet (which opens under them) never hides what the choices have left */}
      <div className='mb-3 flex items-start gap-x-3 px-1'>
        <p
          aria-live='polite'
          className='flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5 text-[15px] text-ph-mute'
        >
          <span>
            {fill(copy.filters.count, {
              shown: String(view.shown.length),
              total: String(view.total),
            })}
          </span>
          {sort.visible && (
            <span className='inline-flex items-center gap-1.5'>
              <ArrowUpDown aria-hidden='true' className='size-3.5 shrink-0' />
              {copy.sort[sort.value]}
            </span>
          )}
        </p>
        {view.clearable && (
          <button
            type='button'
            onClick={view.clear}
            className='inline-flex min-h-6 shrink-0 cursor-pointer items-center text-[15px] font-semibold text-ph-accent-ink underline underline-offset-4 pointer-coarse:min-h-11'
          >
            {copy.filters.clear}
          </button>
        )}
      </div>
      <div
        role='group'
        aria-label={copy.filterLabel}
        className='flex items-center gap-2.5'
      >
        {search.visible && (
          <div className='min-w-0 flex-1'>
            <ProjectsSearch view={view} />
          </div>
        )}
        {anyFilter && <ProjectsFilters view={view} />}
        {sort.visible && <ProjectsSort view={view} />}
      </div>
      <ProjectsActiveFilters view={view} className='mt-3' />
    </div>
  );
}
