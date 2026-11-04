/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ProjectCover } from '@/components/projects/project-cover';
import { skillsOf } from '@/components/projects/project-helpers';
import { homeProjectsCopy } from '@/content/copy/home-projects';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';

/** How many featured projects the Home page shows. */
const LIMIT = 3;

/** The Featured projects block at the bottom of Home: up to three highlighted projects as cards, and a link to all of them. */
export function HomeProjects() {
  const copy = useCopy(homeProjectsCopy);
  const { data: projects = [] } = useContentQuery('projects');
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const featured = projects
    .filter((p) => p.highlight !== null)
    .sort((a, b) => (a.highlight ?? 0) - (b.highlight ?? 0))
    .slice(0, LIMIT);
  if (!featured.length) return null;

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
          className='text-base font-semibold underline underline-offset-4 hover:text-brand'
        >
          {copy.all}
        </Link>
      </div>
      <div className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-6'>
        {featured.map((project) => {
          const tags = skillsOf(project.technologies, skills);
          const href = project.links[0]?.url ?? '/projects';
          const card = (
            <>
              <ProjectCover
                project={project}
                firstSkill={tags[0]}
                className='h-[300px] transition-transform duration-[600ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-105'
              />
              <div className='flex flex-col gap-2 px-7 pt-6 pb-7'>
                <h3 className='text-[22px]'>{project.name}</h3>
                {project.summary && (
                  <p className='line-clamp-3 text-base leading-[1.55] text-[#3a404c]'>
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
            'group flex flex-col overflow-hidden rounded-2xl border bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-[3px] hover:shadow-[0_14px_32px_rgba(27,31,39,.14)] active:bg-white';
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
    </section>
  );
}
