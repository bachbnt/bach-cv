/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowUpRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { LoadingBlock } from '@/components/loading-block';
import { ProjectCover } from '@/components/projects/project-cover';
import { skillsOf } from '@/components/projects/project-helpers';
import { homeProjectsCopy } from '@/content/copy/home-projects';
import { useLive } from '@/hooks/use-live';
import {
  HOME_PROJECTS,
  featuredProjects,
  projectHref,
} from '@/lib/derive/home-lists';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { HomeCardHead } from '@/skins/phone/blocks/home-card-head';
import { ROW_SEPARATOR } from '@/skins/phone/blocks/list-row';
import { HomeGlass } from '@/skins/phone/blocks/home-glass';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

const row = 'flex items-start gap-3.5 py-3.5 text-ph-ink no-underline';

/**
 * The lines of text of the three rows of the seed (the summary is clamped to three lines): how many a row has in a wide card and in a narrow one
 * (a card under 450 px wide), where the same words wrap more. `HOME_PROJECTS` rows is what Home shows.
 */
const SKELETON_ROWS: {
  summary: number;
  summaryNarrow: number;
  tagsNarrow: number;
}[] = [
  { summary: 2, summaryNarrow: 3, tagsNarrow: 1 },
  { summary: 2, summaryNarrow: 2, tagsNarrow: 2 },
  { summary: 3, summaryNarrow: 3, tagsNarrow: 2 },
].slice(0, HOME_PROJECTS);

/** Blank lines of a text, `wide` of them in a wide card and `narrow` (never fewer) in a narrow one, the last one shorter. */
function Lines({
  height,
  wide,
  narrow,
}: {
  height: string;
  wide: number;
  narrow: number;
}) {
  return Array.from({ length: narrow }, (_, n) => (
    <PhSkeletonLine
      key={n}
      line={cn(height, n >= wide && 'hidden @max-[449px]:flex')}
      className={n === narrow - 1 ? 'w-2/3' : 'w-full'}
    />
  ));
}

/**
 * "Featured projects": up to three highlighted projects, each a row with its cover, its name, a few lines and its technologies. A row opens
 * the first link of the project, or the Projects page when it has none. With none featured, or if they cannot be read, the card is left
 * out, as in Standard.
 */
export function HomeProjects() {
  const copy = useCopy(homeProjectsCopy);
  const live = useLive();
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
    <HomeGlass as='section' aria-labelledby='ph-featured-h'>
      <HomeCardHead
        id='ph-featured-h'
        title={copy.title}
        href={live.pages.projects === 'on' ? '/projects' : undefined}
        all={copy.all}
      />
      {projectsQuery.isPending ? (
        <LoadingBlock>
          <ul aria-hidden='true' className='m-0 -mt-1 list-none p-0'>
            {SKELETON_ROWS.map((lines, index) => (
              <li key={index} className={cn(ROW_SEPARATOR, '[--inset:110px]')}>
                <div className={row}>
                  <PhSkeleton className='size-24 shrink-0 rounded-ph-inner' />
                  <div className='min-w-0 flex-1'>
                    <PhSkeletonLine line='h-[20.8px]' className='w-2/3' />
                    <div className='mt-1'>
                      <Lines
                        height='h-[21px]'
                        wide={lines.summary}
                        narrow={lines.summaryNarrow}
                      />
                    </div>
                    <div className='mt-1.5'>
                      <Lines
                        height='h-[18.9px]'
                        wide={1}
                        narrow={lines.tagsNarrow}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </LoadingBlock>
      ) : (
        <ul className='m-0 -mt-1 list-none p-0'>
          {featured.map((project) => {
            const tags = skillsOf(project.technologies, skills);
            const href = projectHref(project);
            const card = (
              <>
                <ProjectCover
                  project={project}
                  firstSkill={tags[0]}
                  className='size-24 shrink-0 rounded-ph-inner text-[28px]'
                />
                <span className='min-w-0 flex-1'>
                  <span className='block text-[16px]/[1.3] font-semibold [overflow-wrap:anywhere]'>
                    {project.name}
                  </span>
                  {project.summary && (
                    <span className='mt-1 line-clamp-3 text-[14px]/[1.5] text-ph-mute'>
                      {project.summary}
                    </span>
                  )}
                  {tags.length > 0 && (
                    <span className='mt-1.5 block text-[13px]/[1.45] text-ph-mute'>
                      {tags.map((tag) => tag.name).join(', ')}
                    </span>
                  )}
                </span>
                {href.startsWith('/') ? (
                  <ChevronRight
                    aria-hidden='true'
                    className='mt-1 size-5 shrink-0 text-ph-mute'
                  />
                ) : (
                  <ArrowUpRight
                    aria-hidden='true'
                    className='mt-1 size-5 shrink-0 text-ph-mute'
                  />
                )}
              </>
            );
            return (
              <li
                key={project.id}
                className={cn(ROW_SEPARATOR, '[--inset:110px]')}
              >
                {href.startsWith('/') ? (
                  <Link href={href} className={row}>
                    {card}
                  </Link>
                ) : (
                  <a href={href} className={row}>
                    {card}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </HomeGlass>
  );
}
