/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { startTransition, useState } from 'react';
import { kindsPresent, skillsOf } from '@/components/projects/project-helpers';
import type { Doc } from '@/lib/content/schema';
import { ProjectCard } from '@/skins/moba/blocks/projects-card';
import {
  ProjectsFilter,
  type KindFilter,
} from '@/skins/moba/blocks/projects-filter';

/** The filter by kind and the grid of every project under it; a filter swaps the cards with a short fade (off for reduced motion). */
export function ProjectsList({
  projects,
  skills,
  onOpenScreenshots,
}: {
  projects: Doc<'projects'>[];
  skills: Map<string, Doc<'skills'>>;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const [filter, setFilter] = useState<KindFilter>('all');
  const kinds = kindsPresent(projects);
  const shown =
    filter === 'all' ? projects : projects.filter((p) => p.kind === filter);
  return (
    <div className='@container'>
      {kinds.length > 1 && (
        <ProjectsFilter
          kinds={kinds}
          value={filter}
          onChange={(value) => startTransition(() => setFilter(value))}
        />
      )}
      <div
        key={filter}
        className='mb-swap grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4'
      >
        {shown.map((project) => (
          <ProjectCard
            key={project.id}
            marked
            project={project}
            skills={skillsOf(project.technologies, skills)}
            onOpenScreenshots={onOpenScreenshots}
          />
        ))}
      </div>
    </div>
  );
}
