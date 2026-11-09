/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { startTransition, useState, ViewTransition } from 'react';
import { kindsPresent } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { ProjectEntry } from '@/skins/academic/blocks/project-entry';
import { AcChip } from '@/skins/academic/ui/ac-chip';

/** The filter chips (All plus each kind that has a project) and the entries under them; filtering does not renumber the references. */
export function ProjectList({
  projects,
  skills,
  onOpenScreenshots,
}: {
  projects: Doc<'projects'>[];
  skills: Map<string, Doc<'skills'>>;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const [filter, setFilter] = useState<'all' | Doc<'projects'>['kind']>('all');
  const kinds = kindsPresent(projects);
  const shown =
    filter === 'all' ? projects : projects.filter((p) => p.kind === filter);

  return (
    <>
      {kinds.length > 1 && (
        <div
          role='group'
          aria-label={copy.filterLabel}
          className='mt-4 flex flex-wrap items-center gap-2'
        >
          {(['all', ...kinds] as const).map((value) => (
            <AcChip
              key={value}
              aria-pressed={filter === value}
              onClick={() => startTransition(() => setFilter(value))}
            >
              {value === 'all' ? copy.filterAll : copy.kinds[value]}
            </AcChip>
          ))}
        </div>
      )}
      {/* a filter swaps the list: the old entries fade out and the new ones in (a transition, so it is off for "reduce motion") */}
      <ViewTransition
        key={filter}
        enter='ac-vt-in'
        exit='ac-vt-out'
        default='none'
      >
        <ol className='m-0 mt-6 list-none p-0'>
          {shown.map((project) => (
            <li
              key={project.id}
              className='border-t-2 border-dashed border-ac-faint py-[22px] first:border-t-0 first:pt-0'
            >
              <ProjectEntry
                project={project}
                number={projects.indexOf(project) + 1}
                skills={skills}
                onOpenScreenshots={onOpenScreenshots}
              />
            </li>
          ))}
        </ol>
      </ViewTransition>
    </>
  );
}
