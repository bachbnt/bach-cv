/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { CardsSkeleton } from '@/components/cards-skeleton';
import { LoadingBlock } from '@/components/loading-block';
import { ProjectCover } from '@/components/projects/project-cover';
import { skillsOf } from '@/components/projects/project-helpers';
import { homeProjectsCopy } from '@/content/copy/home-projects';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { highlighted } from '@/lib/derive/highlighted';

/** How many featured projects the Home page shows. */
const LIMIT = 3;

/** The Featured projects block at the bottom of Home: up to three highlighted projects as cards, and a link to all of them. */
export function HomeProjects() {
  const copy = useCopy(homeProjectsCopy);
  const projectsQuery = useContentQuery('projects');
  const projects = projectsQuery.data ?? [];
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const featured = highlighted(projects).slice(0, LIMIT);
  // featured projects are an extra, so with none (or if they fail to load) the section is simply left out
  if (projectsQuery.isError || (!projectsQuery.isPending && !featured.length))
    return null;

  return (
    <section
      aria-labelledby='proj-h'
      className='mx-auto w-full max-w-[1200px] px-5 py-24 min-[721px]:px-12'
    >
      <div className='mb-8 flex flex-wrap items-baseline justify-between gap-3'>
        <h2 id='proj-h' className='text-[30px] min-[721px]:text-[40px]'>
          {copy.title}
        </h2>
        <Link
          href='/projects'
          className='text-base font-semibold underline underline-offset-4 hover:text-brand-ink'
        >
          {copy.all}
        </Link>
      </div>
      {projectsQuery.isPending ? (
        <LoadingBlock>
          <CardsSkeleton count={LIMIT} min={280} height={440} />
        </LoadingBlock>
      ) : (
        <div className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-6'>
          {featured.map((project) => {
            const tags = skillsOf(project.technologies, skills);
            const href = project.links[0]?.url ?? '/projects';
            const card = (
              <>
                <ProjectCover
                  project={project}
                  firstSkill={tags[0]}
                  className='h-[300px] transition-transform duration-[600ms] ease-[cubic-bezier(.2,.7,.2,1)] motion-safe:group-hover:scale-105 motion-reduce:transition-none'
                />
                <div className='flex flex-col gap-2 px-7 pt-6 pb-7'>
                  <h3 className='text-[22px]'>{project.name}</h3>
                  {project.summary && (
                    <p className='line-clamp-3 text-base leading-[1.55] text-body'>
                      {project.summary}
                    </p>
                  )}
                  {tags.length > 0 && (
                    <p className='mt-1.5 text-sm text-muted-foreground'>
                      {tags.map((t) => t.name).join(', ')}
                    </p>
                  )}
                </div>
              </>
            );
            const className =
              'glow lift group flex flex-col overflow-hidden rounded-2xl border bg-card';
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
  );
}
