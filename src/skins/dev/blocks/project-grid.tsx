/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import { useProjectView } from '@/hooks/use-project-view';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { ProjectCard } from '@/skins/dev/blocks/project-card';
import { DevProjectsToolbar } from '@/skins/dev/blocks/projects-toolbar';

/** The columns of the grid of cards (shared with the loading skeleton). */
export const PROJECT_CARD_GRID =
  'grid grid-cols-[repeat(3,1fr)] gap-4 max-[900px]:grid-cols-[1fr_1fr] max-[620px]:grid-cols-[1fr]';

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
  return (
    <>
      <DevProjectsToolbar view={view} />
      {view.shown.length > 0 ? (
        <div className={PROJECT_CARD_GRID}>
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
        <div
          role='status'
          className='flex max-w-[640px] flex-wrap items-center gap-x-4 gap-y-2 rounded-[8px] border border-dashed border-line-2 bg-chrome px-[22px] py-5 font-code text-[14px] text-mute'
        >
          <span>{copy.filters.none}</span>
          {view.clearable && (
            <button
              type='button'
              onClick={view.clear}
              className='cursor-pointer border-0 border-b border-b-transparent bg-transparent p-0 font-code text-[13px] text-sky hover:border-b-sky focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal pointer-coarse:min-h-11'
            >
              {copy.filters.clear}
            </button>
          )}
        </div>
      )}
    </>
  );
}
