/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { devCopy } from '@/content/copy/dev';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { FeaturedProject } from '@/skins/dev/blocks/featured-project';
import { ProjectGrid } from '@/skins/dev/blocks/project-grid';
import { useOpenScreenshots } from '@/skins/dev/blocks/use-open-screenshots';
import { countHint } from '@/skins/dev/ui/count-hint';
import { DevDataState } from '@/skins/dev/ui/dev-data-state';
import { DevSection } from '@/skins/dev/ui/dev-section';
import { DevCardsSkeleton } from '@/skins/dev/ui/dev-skeleton';

/** Featured projects (by rank), then every project with the kind filter. */
export function ProjectsContent() {
  const copy = useCopy(projectsCopy);
  const { hints } = useCopy(devCopy);
  const projectsQuery = useContentQuery('projects');
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const openScreenshots = useOpenScreenshots(skills);

  const projects = projectsQuery.data ?? [];
  const featured = projects
    .filter((p) => p.highlight !== null)
    .sort((a, b) => (a.highlight ?? 0) - (b.highlight ?? 0));

  return (
    <DevDataState
      query={projectsQuery}
      count={projects.length}
      empty='projects'
      subject='projects'
      skeleton={<DevCardsSkeleton count={3} min={320} height={380} />}
      className='mt-[54px]'
    >
      {featured.length > 0 && (
        <DevSection
          title={copy.featured}
          hint={countHint(hints, 'projects', featured.length)}
        >
          <div className='grid gap-[18px]'>
            {featured.map((project) => (
              <FeaturedProject
                key={project.id}
                project={project}
                skills={skills}
                onOpenScreenshots={openScreenshots}
              />
            ))}
          </div>
        </DevSection>
      )}
      <DevSection
        title={copy.all}
        hint={countHint(hints, 'projects', projects.length)}
      >
        <ProjectGrid
          projects={projects}
          skills={skills}
          onOpenScreenshots={openScreenshots}
        />
      </DevSection>
    </DevDataState>
  );
}
