/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { devCopy } from '@/content/copy/dev';
import { homeProjectsCopy } from '@/content/copy/home-projects';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { highlighted } from '@/lib/derive/highlighted';
import { HomeProjectCard } from '@/skins/dev/blocks/home-project-card';
import { countHint } from '@/skins/dev/ui/count-hint';
import { DevCardsSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevDataState } from '@/skins/dev/ui/dev-data-state';
import { DevSection } from '@/skins/dev/ui/dev-section';

const LIMIT = 3;

/** Up to three highlighted projects. Each card opens the project's first link, or the Projects page, as in the Standard skin. */
export function HomeProjects() {
  const copy = useCopy(homeProjectsCopy);
  const dev = useCopy(devCopy);
  const projectsQuery = useContentQuery('projects');
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const featured = highlighted(projectsQuery.data ?? []).slice(0, LIMIT);

  // featured projects are an extra: with none, or if they fail to load, the section is left out
  if (projectsQuery.isError || (!projectsQuery.isPending && !featured.length))
    return null;

  return (
    <DevSection
      title={copy.title}
      hint={
        featured.length
          ? countHint(dev.hints, 'projects', featured.length)
          : undefined
      }
      action={{ label: copy.all, href: '/projects' }}
    >
      <DevDataState
        query={projectsQuery}
        count={featured.length}
        empty='projects'
        subject='projects'
        skeleton={<DevCardsSkeleton count={LIMIT} min={260} height={380} />}
      >
        <div className='grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1'>
          {featured.map((project) => (
            <HomeProjectCard
              key={project.id}
              project={project}
              skills={skills}
            />
          ))}
        </div>
      </DevDataState>
    </DevSection>
  );
}
