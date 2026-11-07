/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { fillCopy, skillsOf } from '@/components/projects/project-helpers';
import { mobaProjectsCopy } from '@/content/copy/moba-projects';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { highlighted } from '@/lib/derive/highlighted';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ProjectCard } from '@/skins/moba/blocks/projects-card';
import { ProjectsList } from '@/skins/moba/blocks/projects-list';
import { useOverlays } from '@/skins/moba/shell/overlay-context';
import { MbDataState } from '@/skins/moba/ui/mb-data-state';
import { MbSection } from '@/skins/moba/ui/mb-section';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';

/** The shape of the page while it loads: one big objective, then a row of cards. */
function BoardSkeleton() {
  return (
    <div className='grid gap-4 px-6 pb-8 max-[719px]:px-4'>
      <MbSkeleton className='h-[270px]' />
      <div className='grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4'>
        {Array.from({ length: 3 }, (_, i) => (
          <MbSkeleton key={i} className='h-[400px]' />
        ))}
      </div>
    </div>
  );
}

/**
 * The objectives: the featured projects (by rank) as the big ones, then every project with the filter by kind. A project's screenshots
 * open in the picture viewer, with the Standard words on its controls.
 */
export function ProjectsBoard() {
  const copy = useCopy(projectsCopy);
  const mb = useCopy(mobaProjectsCopy);
  const query = useContentQuery('projects');
  const { data: skillList = [] } = useContentQuery('skills');
  const { openViewer } = useOverlays();
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const projects = query.data ?? [];
  const top = highlighted(projects);

  const openScreenshots = (project: Doc<'projects'>) =>
    openViewer(
      project.images.map((src, i) => ({
        src,
        title: project.name,
        subtitle: copy.kinds[project.kind],
        alt: fillCopy(copy.dialog.alt, { name: project.name, current: i + 1 }),
        labels: {
          close: copy.dialog.close,
          previous: copy.dialog.previous,
          next: copy.dialog.next,
        },
        thumbnailLabel: fillCopy(copy.dialog.thumbnail, { current: i + 1 }),
      })),
      0,
    );

  return (
    <MbDataState
      query={query}
      count={projects.length}
      empty='projects'
      subject='projects'
      skeleton={<BoardSkeleton />}
      className='mx-6 mb-8 max-[719px]:mx-4'
    >
      {top.length > 0 && (
        <MbSection
          id='featured'
          kicker={mb.kickers.featured}
          title={copy.featured}
          order={1}
        >
          <div className='@container'>
            <div className='grid gap-4'>
              {top.map((project) => (
                <ProjectCard
                  key={project.id}
                  big
                  project={project}
                  skills={skillsOf(project.technologies, skills)}
                  onOpenScreenshots={openScreenshots}
                />
              ))}
            </div>
          </div>
        </MbSection>
      )}
      <MbSection id='all' kicker={mb.kickers.all} title={copy.all} order={2}>
        <ProjectsList
          projects={projects}
          skills={skills}
          onOpenScreenshots={openScreenshots}
        />
      </MbSection>
    </MbDataState>
  );
}
