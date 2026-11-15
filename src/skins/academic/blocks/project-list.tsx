/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ViewTransition } from 'react';
import { projectsCopy } from '@/content/copy/projects';
import { useProjectView } from '@/hooks/use-project-view';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { ProjectEntry } from '@/skins/academic/blocks/project-entry';
import { AcProjectsToolbar } from '@/skins/academic/blocks/projects-toolbar';

const NOTE_BUTTON =
  'inline-flex min-h-8 cursor-pointer items-center border-0 bg-transparent p-0 font-ac-note text-[18px] text-ac-link underline underline-offset-4 pointer-coarse:min-h-11';

/** The controls (search, order, filters) and the entries under them; neither filtering nor sorting renumbers the references. */
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
  const view = useProjectView(projects, skills);
  // a swap of the list is a transition (the words typed in the search box just change it, one key at a time)
  const swap = [
    view.sort.value,
    ...Object.values(view.groups).map((group) => group.selected.join('+')),
  ].join('|');

  return (
    <>
      <AcProjectsToolbar view={view} />
      {/* a swap of the list: the old entries fade out and the new ones in (a transition, so it is off for "reduce motion") */}
      <ViewTransition
        key={swap}
        enter='ac-vt-in'
        exit='ac-vt-out'
        default='none'
      >
        {view.shown.length > 0 ? (
          <ol className='m-0 mt-6 list-none p-0'>
            {view.shown.map((project) => (
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
        ) : (
          <div
            role='status'
            className='mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-ac-note text-[19px] text-ac-mute'
          >
            <span>{copy.filters.none}</span>
            {view.clearable && (
              <button
                type='button'
                onClick={view.clear}
                className={NOTE_BUTTON}
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
