/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { projectsCopy } from '@/content/copy/projects';
import { highlighted } from '@/lib/derive/highlighted';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ProjectEntry } from '@/skins/academic/blocks/project-entry';
import { ProjectList } from '@/skins/academic/blocks/project-list';
import { useOpenScreenshots } from '@/skins/academic/blocks/use-open-screenshots';
import { ProjectSkeleton } from '@/skins/academic/blocks/project-skeleton';
import { AcDataState } from '@/skins/academic/ui/ac-data-state';
import { AcHeading } from '@/skins/academic/ui/ac-section';

/** Featured projects (by rank), then every project with the kind filter. The same two parts as Standard. */
export function ProjectsContent() {
  const copy = useCopy(projectsCopy);
  const projectsQuery = useContentQuery('projects');
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const openScreenshots = useOpenScreenshots();

  const projects = projectsQuery.data ?? [];
  const featured = highlighted(projects);

  return (
    <AcDataState
      query={projectsQuery}
      count={projects.length}
      empty='projects'
      subject='projects'
      skeleton={<ProjectSkeleton />}
      className='mt-6'
    >
      {featured.length > 0 && (
        <section>
          <AcHeading className='mt-6 mb-5'>{copy.featured}</AcHeading>
          <ol className='m-0 list-none p-0'>
            {featured.map((project) => (
              <li
                key={project.id}
                className='border-t-2 border-dashed border-ac-faint py-[22px] first:border-t-0 first:pt-0'
              >
                <ProjectEntry
                  featured
                  project={project}
                  number={projects.indexOf(project) + 1}
                  skills={skills}
                  onOpenScreenshots={openScreenshots}
                />
              </li>
            ))}
          </ol>
        </section>
      )}
      <section>
        <AcHeading className={featured.length > 0 ? 'mt-14 mb-1' : 'mt-6 mb-1'}>
          {copy.all}
        </AcHeading>
        <ProjectList
          projects={projects}
          skills={skills}
          onOpenScreenshots={openScreenshots}
        />
      </section>
    </AcDataState>
  );
}
