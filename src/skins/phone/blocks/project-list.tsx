/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useId } from 'react';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { ProjectRow } from '@/skins/phone/blocks/project-row';
import { PROJECT_LIST_CARD } from '@/skins/phone/blocks/projects-layout';

/** The projects that pass the filters, in the order chosen, as one card of rows. `selectedId` is the project the detail shows. */
export function ProjectList({
  projects,
  skills,
  selectedId,
  onSelect,
}: {
  projects: Doc<'projects'>[];
  skills: Map<string, Doc<'skills'>>;
  selectedId: string | undefined;
  onSelect: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const id = useId();
  return (
    <>
      {/* the heading Standard shows, so the names of the rows (level 3) follow a level 2 under the title of the page */}
      <h2 id={id} className='sr-only'>
        {copy.all}
      </h2>
      <ol aria-labelledby={id} className={PROJECT_LIST_CARD}>
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            skills={skills}
            selected={project.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </ol>
    </>
  );
}
