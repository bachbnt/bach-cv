/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { ProjectCover } from '@/components/projects/project-cover';
import { skillsOf } from '@/components/projects/project-helpers';
import { homeProjectsCopy } from '@/content/copy/home-projects';
import { statesCopy } from '@/content/copy/states';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { PREVIEW_MS } from '@/skins/stream/blocks/career-preview';
import { useCareerPreview } from '@/skins/stream/blocks/career-use-preview';
import { StreamHeading } from '@/skins/stream/ui/stream-heading';
import { StreamLink } from '@/skins/stream/ui/stream-link';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

/** How many featured projects the Home page shows, as Standard does. */
const LIMIT = 3;

/**
 * The featured projects of Home (by rank, up to three) as the video grid of a channel: the cover as a 16:9 thumbnail, the name, the
 * summary and the technologies; the whole card is the link Standard gives it (the first link of the project, or the Projects page). A mouse resting on a thumbnail plays a preview of its screenshots.
 */
export function CareerProjects() {
  const copy = useCopy(homeProjectsCopy);
  const { loading } = useCopy(statesCopy);
  const projectsQuery = useContentQuery('projects');
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const featured = (projectsQuery.data ?? [])
    .filter((p) => p.highlight !== null)
    .sort((a, b) => (a.highlight ?? 0) - (b.highlight ?? 0))
    .slice(0, LIMIT);
  // featured projects are an extra, so with none (or if they fail to load) the block is simply left out
  if (projectsQuery.isError || (!projectsQuery.isPending && !featured.length))
    return null;

  return (
    <section aria-labelledby='proj-h' className='mt-8 px-3 min-[701px]:px-0'>
      <StreamHeading
        id='proj-h'
        action={<StreamLink href='/projects'>{copy.all}</StreamLink>}
      >
        {copy.title}
      </StreamHeading>
      {projectsQuery.isPending ? (
        <div
          role='status'
          aria-busy='true'
          aria-label={loading}
          className='grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-x-4 gap-y-6'
        >
          {Array.from({ length: LIMIT }, (_, i) => (
            <div key={i} className='flex flex-col gap-3'>
              <StreamSkeleton className='aspect-video' />
              <StreamSkeleton className='h-4 w-4/5 rounded-md' />
              <StreamSkeleton className='h-3.5 w-3/5 rounded-md' />
            </div>
          ))}
        </div>
      ) : (
        <ul className='m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-x-4 gap-y-6 p-0'>
          {featured.map((project) => (
            <li key={project.id} className='min-w-0'>
              <CareerProjectCard project={project} skills={skills} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CareerProjectCard({
  project,
  skills,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
}) {
  const preview = useCareerPreview(project.images);
  const tags = skillsOf(project.technologies, skills);
  const href = project.links[0]?.url ?? '/projects';
  const inside = href.startsWith('/');
  const body = (
    <>
      <div
        {...preview.pointer}
        className='relative aspect-video overflow-hidden rounded-xl bg-sm-hover'
      >
        <ProjectCover
          project={project}
          firstSkill={tags[0]}
          className='h-full text-2xl'
        />
        {preview.frame !== null && (
          <>
            <Image
              src={project.images[preview.frame]}
              alt=''
              fill
              sizes='(min-width: 701px) 400px, 100vw'
              data-career-preview=''
              className='bg-black object-contain'
            />
            <span
              key={preview.frame}
              aria-hidden='true'
              style={{ animationDuration: `${PREVIEW_MS}ms` }}
              className='absolute inset-x-0 bottom-0 h-[3px] origin-left animate-[sm-preview_linear_both] bg-sm-red'
            />
          </>
        )}
      </div>
      <h3 className='mt-2 line-clamp-2 text-base/[1.3] font-medium group-hover/card:text-sm-blue'>
        {project.name}
      </h3>
      {project.summary && (
        <p className='mt-0.5 line-clamp-3 text-[13px]/[1.45] text-sm-mute'>
          {project.summary}
        </p>
      )}
      {tags.length > 0 && (
        <p className='mt-0.5 line-clamp-2 text-xs text-sm-mute'>
          {tags.map((t) => t.name).join(', ')}
        </p>
      )}
    </>
  );
  const classes = 'group/card block rounded-xl';
  return (
    <article>
      {inside ? (
        <Link href={href} {...preview.focus} className={classes}>
          {body}
        </Link>
      ) : (
        <a href={href} {...preview.focus} className={classes}>
          {body}
        </a>
      )}
    </article>
  );
}
