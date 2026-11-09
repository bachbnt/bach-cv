/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ProjectCover } from '@/components/projects/project-cover';
import { skillsOf } from '@/components/projects/project-helpers';
import { homeProjectsCopy } from '@/content/copy/home-projects';
import { statesCopy } from '@/content/copy/states';
import {
  HOME_PROJECTS,
  featuredProjects,
  projectHref,
} from '@/lib/derive/home-lists';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { HomeCol } from '@/skins/academic/blocks/home-col';
import { AcHeading } from '@/skins/academic/ui/ac-section';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';

const TILTS = [-1.3, 1, -0.7] as const;

/**
 * "Featured projects": up to three highlighted projects as photographs taped to the board, each with its name, a few lines and its technologies.
 * A card opens the first link of the project, or the Projects page when it has none; with none featured (or if they fail to load) the block is left
 * out, as in Standard.
 */
export function HomeProjects() {
  const copy = useCopy(homeProjectsCopy);
  const states = useCopy(statesCopy);
  const projectsQuery = useContentQuery('projects');
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((skill) => [skill.id, skill])),
    [skillList],
  );
  const featured = featuredProjects(projectsQuery.data ?? []);
  if (projectsQuery.isError || (!projectsQuery.isPending && !featured.length))
    return null;

  return (
    <HomeCol className='mt-16'>
      <section aria-labelledby='proj-h'>
        <div className='mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
          <AcHeading id='proj-h'>{copy.title}</AcHeading>
          <Link
            href='/projects'
            className='font-ac-note text-[19px] text-ac-link underline underline-offset-4 pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center'
          >
            {copy.all}
          </Link>
        </div>
        {projectsQuery.isPending ? (
          <div role='status' aria-busy='true' aria-label={states.loading}>
            <div className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-8'>
              {Array.from({ length: HOME_PROJECTS }, (_, i) => (
                <AcSkeleton key={i} className='h-[300px]' />
              ))}
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-x-8 gap-y-10'>
            {featured.map((project, index) => {
              const tags = skillsOf(project.technologies, skills);
              const href = projectHref(project);
              const card = (
                <>
                  <span
                    style={{ rotate: `${TILTS[index % TILTS.length]}deg` }}
                    className='ac-tape ac-wind relative block bg-ac-polaroid p-2 pb-3 shadow-ac-photo'
                  >
                    <ProjectCover
                      project={project}
                      firstSkill={tags[0]}
                      className='h-[190px]'
                    />
                  </span>
                  <span className='mt-4 block'>
                    <h3 className='ac-glow m-0 font-ac-chalk text-[26px]/[1.15] font-normal'>
                      {project.name}
                    </h3>
                    {project.summary && (
                      <span className='mt-1 line-clamp-3 block text-[0.94em]'>
                        {project.summary}
                      </span>
                    )}
                    {tags.length > 0 && (
                      <span className='mt-1.5 block font-ac-note text-[15.5px] text-ac-mute'>
                        {tags.map((tag) => tag.name).join(', ')}
                      </span>
                    )}
                  </span>
                </>
              );
              const className = 'group block no-underline';
              return href.startsWith('/') ? (
                <Link key={project.id} href={href} className={className}>
                  {card}
                </Link>
              ) : (
                <a key={project.id} href={href} className={className}>
                  {card}
                </a>
              );
            })}
          </div>
        )}
      </section>
    </HomeCol>
  );
}
