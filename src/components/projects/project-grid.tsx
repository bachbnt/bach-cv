/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ViewTransition } from 'react';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectsToolbar } from '@/components/projects/projects-toolbar';
import { projectsCopy } from '@/content/copy/projects';
import { useProjectView } from '@/hooks/use-project-view';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';

/** The controls of the Projects page (search, order, filters) and the grid of cards under them. */
export function ProjectGrid({
  projects,
  skills,
  onOpenScreenshots,
}: {
  projects: Doc<'projects'>[];
  skills: Map<string, Doc<'skills'>>;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const view = useProjectView(projects, skills);
  // a swap of the list is a transition (the words typed in the search box just change it, one key at a time)
  const swap = [
    view.sort.value,
    ...Object.values(view.groups).map((group) => group.selected.join('+')),
  ].join('|');

  return (
    <>
      <ProjectsToolbar view={view} />
      {/* a filter swaps the grid: the old cards fade out and the new ones rise in (a transition, so it is off for "reduce motion") */}
      <ViewTransition key={swap} enter='list-in' exit='list-out' default='none'>
        {view.shown.length > 0 ? (
          <div className='mt-8 grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-6'>
            {view.shown.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                skills={skills}
                onOpenScreenshots={onOpenScreenshots}
              />
            ))}
          </div>
        ) : (
          <div className='mt-8 flex flex-col items-start gap-3 rounded-2xl border bg-card p-6'>
            <p className='text-base text-body'>{copy.filters.none}</p>
            {view.clearable && (
              <button
                type='button'
                onClick={view.clear}
                className='inline-flex min-h-11 items-center text-[15px] font-semibold text-brand-ink underline underline-offset-4'
              >
                {copy.filters.clear}
              </button>
            )}
          </div>
        )}
      </ViewTransition>
    </>
  );
}
