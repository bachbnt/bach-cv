/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { ProjectCover } from '@/components/projects/project-cover';
import { skillsOf } from '@/components/projects/project-helpers';
import { homeProjectsCopy } from '@/content/copy/home-projects';
import { mobaHomeCopy } from '@/content/copy/moba-home';
import { highlighted } from '@/lib/derive/highlighted';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { MbSection } from '@/skins/moba/ui/mb-section';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';

/** How many featured projects Home shows. */
const LIMIT = 3;

/**
 * "Featured projects" as three objectives: a cover, the name, a summary and the technologies, each linking to the project's first link
 * (or to the Projects page). With none, or if they fail to load, the section is left out, as on Standard.
 */
export function HomeFeatured() {
  const copy = useCopy(homeProjectsCopy);
  const mb = useCopy(mobaHomeCopy);
  const query = useContentQuery('projects');
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const shown = highlighted(query.data ?? []).slice(0, LIMIT);
  if (query.isError || (!query.isPending && !shown.length)) return null;
  return (
    <MbSection
      id='featured'
      kicker={mb.kickers.featured}
      title={copy.title}
      order={4}
      aside={
        <Link
          href='/projects'
          className='inline-flex min-h-9 items-center gap-1.5 text-sm font-bold text-mb-gold-ink underline underline-offset-4 hover:text-mb-title pointer-coarse:min-h-11'
        >
          {copy.all}
          <ArrowRight aria-hidden='true' className='size-4' />
        </Link>
      }
    >
      {query.isPending ? (
        <div
          role='status'
          aria-busy='true'
          className='grid gap-3 min-[760px]:grid-cols-3'
        >
          {Array.from({ length: LIMIT }, (_, i) => (
            <MbSkeleton key={i} className='h-[300px]' />
          ))}
        </div>
      ) : (
        <ul className='m-0 grid list-none gap-3 p-0 min-[760px]:grid-cols-3'>
          {shown.map((project) => {
            const tags = skillsOf(project.technologies, skills);
            const href = project.links[0]?.url ?? '/projects';
            const body = (
              <>
                <span className='block overflow-hidden bg-mb-well'>
                  <ProjectCover
                    project={project}
                    firstSkill={tags[0]}
                    className='h-[170px] transition-transform duration-500 group-hover/card:scale-105 motion-reduce:transition-none'
                  />
                </span>
                <span className='block px-4 pt-3 pb-4'>
                  <span className='block font-mb-display text-[22px] leading-tight font-bold text-mb-title'>
                    {project.name}
                  </span>
                  {project.summary && (
                    <span className='mt-1.5 line-clamp-3 block text-[14px] leading-[1.5] text-mb-mute'>
                      {project.summary}
                    </span>
                  )}
                  {tags.length > 0 && (
                    <span className='mt-2 block text-[12.5px] text-mb-gold-ink'>
                      {tags.map((t) => t.name).join(', ')}
                    </span>
                  )}
                </span>
              </>
            );
            const className =
              'mb-plaque mb-plaque-lift group/card block h-full overflow-hidden';
            return (
              <li key={project.id}>
                {href.startsWith('/') ? (
                  <Link href={href} className={className}>
                    {body}
                  </Link>
                ) : (
                  <a href={href} className={className}>
                    {body}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </MbSection>
  );
}
