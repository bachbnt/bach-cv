/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { ProjectCard } from '@/components/projects/project-card';
import { kindsPresent } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from 'cn';

const chip =
  'inline-flex min-h-11 items-center rounded-full border-[1.5px] px-[18px] py-[9px] text-[15px] font-medium transition-[color,background-color,border-color,transform] active:scale-[.97] min-[721px]:min-h-0 pointer-coarse:min-h-11';

/** The filter chips (All plus each kind that has a project) and the grid of cards under them. */
export function ProjectGrid({
  projects,
  skills,
}: {
  projects: Doc<'projects'>[];
  skills: Map<string, Doc<'skills'>>;
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
          className='mt-6 flex flex-wrap gap-2.5'
        >
          {(['all', ...kinds] as const).map((value) => {
            const pressed = filter === value;
            return (
              <button
                key={value}
                type='button'
                aria-pressed={pressed}
                onClick={() => setFilter(value)}
                className={cn(
                  chip,
                  pressed
                    ? 'border-page bg-page text-white'
                    : 'border-border bg-white hover:border-foreground active:border-foreground',
                )}
              >
                {value === 'all' ? copy.filterAll : copy.kinds[value]}
              </button>
            );
          })}
        </div>
      )}
      <div className='mt-8 grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-6'>
        {shown.map((project) => (
          <ProjectCard key={project.id} project={project} skills={skills} />
        ))}
      </div>
    </>
  );
}
