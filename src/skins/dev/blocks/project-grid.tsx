/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { kindsPresent } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { DevFilterGroup } from '@/skins/dev/blocks/filter-group';
import { ProjectCard } from '@/skins/dev/blocks/project-card';

/** The filter chips (All plus each kind that has a project) and the grid of cards under them. */
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
  const [filter, setFilter] = useState<'all' | Doc<'projects'>['kind']>('all');
  const kinds = kindsPresent(projects);
  const shown =
    filter === 'all' ? projects : projects.filter((p) => p.kind === filter);

  return (
    <>
      {kinds.length > 1 && (
        <DevFilterGroup
          label={copy.filterLabel}
          value={filter}
          options={(['all', ...kinds] as const).map((value) => ({
            value,
            label: value === 'all' ? copy.filterAll : copy.kinds[value],
          }))}
          onChange={setFilter}
        />
      )}
      <div className='grid grid-cols-[repeat(3,1fr)] gap-4 max-[900px]:grid-cols-[1fr_1fr] max-[620px]:grid-cols-[1fr]'>
        {shown.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            skills={skills}
            onOpenScreenshots={onOpenScreenshots}
          />
        ))}
      </div>
    </>
  );
}
