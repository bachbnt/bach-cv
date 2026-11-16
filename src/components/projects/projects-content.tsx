/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo, useState } from 'react';
import { DataState } from '@/components/data-state';
import { FeaturedProject } from '@/components/projects/featured-project';
import { ProjectGrid } from '@/components/projects/project-grid';
import { ScreenshotsDialog } from '@/components/projects/screenshots-dialog';
import {
  PROJECTS_HEADING,
  ProjectsSkeleton,
} from '@/components/projects/projects-skeleton';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from 'cn';
import { useContentQuery } from '@/lib/query/use-content';
import { highlighted } from '@/lib/derive/highlighted';

/** Featured projects (by rank), then every project with the kind filter. */
export function ProjectsContent() {
  const copy = useCopy(projectsCopy);
  const projectsQuery = useContentQuery('projects');
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const [active, setActive] = useState<Doc<'projects'> | null>(null);
  const [open, setOpen] = useState(false);

  const openScreenshots = (project: Doc<'projects'>) => {
    setActive(project);
    setOpen(true);
  };

  const projects = projectsQuery.data ?? [];
  const featured = highlighted(projects);

  return (
    <section className='mx-auto w-full max-w-[1200px] px-5 pt-14 pb-24 min-[721px]:px-12'>
      <DataState
        query={projectsQuery}
        count={projects.length}
        empty='projects'
        subject='projects'
        skeleton={<ProjectsSkeleton />}
        className='mt-2'
        skeletonClassName='mt-0'
      >
        {featured.length > 0 && (
          <>
            <h2 className={PROJECTS_HEADING}>{copy.featured}</h2>
            <div className='mt-6 flex flex-col gap-6'>
              {featured.map((project) => (
                <FeaturedProject
                  key={project.id}
                  project={project}
                  skills={skills}
                  onOpenScreenshots={openScreenshots}
                />
              ))}
            </div>
          </>
        )}
        <h2 className={cn(PROJECTS_HEADING, featured.length > 0 && 'mt-20')}>
          {copy.all}
        </h2>
        <ProjectGrid
          projects={projects}
          skills={skills}
          onOpenScreenshots={openScreenshots}
        />
      </DataState>
      {active && (
        <ScreenshotsDialog
          name={active.name}
          images={active.images}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </section>
  );
}
