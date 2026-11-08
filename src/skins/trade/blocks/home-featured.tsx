/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { fillCopy, skillsOf } from '@/components/projects/project-helpers';
import { initialsOf } from '@/lib/derive/initials';
import { homeProjectsCopy } from '@/content/copy/home-projects';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc, Skill } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import {
  HOME_PROJECTS,
  featuredProjects,
  projectHref,
} from '@/lib/derive/home-lists';
import { ProjectLinks } from '@/skins/trade/blocks/project-links';
import { useSkillMap } from '@/skins/trade/blocks/use-skill-map';
import { ShellWidget } from '@/skins/trade/ui/shell-widget';
import { TvChip } from '@/skins/trade/ui/tv-chip';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/** How many technologies an idea card names before it says how many more there are. */
const TECH_SHOWN = 5;

const TILE: Record<Skill['category'], string> = {
  mobile: 'bg-tv-up-bg text-tv-up-ink',
  web: 'bg-tv-sky/15 text-tv-sky-ink',
  ai: 'bg-tv-violet/20 text-tv-violet-ink',
  tools: 'bg-tv-gold/15 text-tv-gold-ink',
};

/** The featured projects of Home (those with a rank, at most three) and the link to all of them. */
export function useFeaturedProjects() {
  const query = useContentQuery('projects');
  const featured = featuredProjects(query.data ?? []);
  return { query, featured };
}

function IdeaCard({
  project,
  skills,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
}) {
  const copy = useCopy(projectsCopy);
  const techs = skillsOf(project.technologies, skills);
  const href = projectHref(project);
  const title = href.startsWith('/') ? (
    <Link
      href={href}
      data-slot='tv-link'
      className='after:absolute after:inset-0 after:content-[""]'
    >
      {project.name}
    </Link>
  ) : (
    <a
      href={href}
      data-slot='tv-link'
      className='after:absolute after:inset-0 after:content-[""]'
    >
      {project.name}
    </a>
  );
  return (
    <li
      data-testid='idea'
      className='tv-rise group/idea relative flex flex-col overflow-hidden rounded-md border border-tv-line bg-tv-bg transition-[translate,border-color] duration-160 hover:-translate-y-0.5 hover:border-tv-accent/60 active:translate-y-0'
    >
      <div className='relative aspect-[16/9] overflow-hidden bg-tv-hover'>
        {project.cover ? (
          <Image
            src={project.cover}
            alt={fillCopy(copy.coverAlt, { name: project.name })}
            fill
            sizes='(min-width: 1100px) 320px, 100vw'
            className='object-cover object-top transition-transform duration-300 ease-tv-out group-hover/idea:scale-105'
          />
        ) : (
          <span
            aria-hidden='true'
            className={cn(
              'absolute inset-0 grid place-items-center text-4xl font-bold',
              techs[0] ? TILE[techs[0].category] : 'text-tv-mute',
            )}
          >
            {initialsOf(project.name)}
          </span>
        )}
      </div>
      <div className='flex flex-1 flex-col gap-1.5 p-3'>
        <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
          <TvChip tone='accent'>{copy.kinds[project.kind]}</TvChip>
          {project.startMonth && (
            <span className='text-[11px] text-tv-mute tabular-nums'>
              {project.startMonth.slice(0, 4)}
            </span>
          )}
        </div>
        <h3 className='text-[13px] leading-snug font-semibold'>{title}</h3>
        {project.summary && (
          <p className='line-clamp-3 text-xs/[1.55] text-tv-mute'>
            {project.summary}
          </p>
        )}
        {techs.length > 0 && (
          <p className='text-[11px] text-tv-ink'>
            {techs
              .slice(0, TECH_SHOWN)
              .map((t) => t.name)
              .join(', ')}
            {techs.length > TECH_SHOWN && (
              <span className='text-tv-mute'>
                {' '}
                +{techs.length - TECH_SHOWN}
              </span>
            )}
          </p>
        )}
        {project.links.length > 0 && (
          <div className='relative z-[1] mt-auto pt-1 text-xs'>
            <ProjectLinks links={project.links} />
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * The featured projects of Home as idea cards: cover, kind and year, name (the link, as in Standard), summary, technologies and the links.
 * The projects are an extra in Standard, so with none (or if they fail to load) the whole widget is left out.
 */
export function HomeFeatured() {
  const copy = useCopy(homeProjectsCopy);
  const { query, featured } = useFeaturedProjects();
  const skills = useSkillMap();
  if (query.isError || (!query.isPending && featured.length === 0)) return null;
  return (
    <ShellWidget
      id='tv-home-projects'
      titleId='tv-proj-h'
      title={copy.title}
      action={
        <Link
          href='/projects'
          data-slot='tv-link'
          className='text-[13px] font-medium text-tv-accent-ink underline-offset-[3px] hover:underline pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center'
        >
          {copy.all}
        </Link>
      }
    >
      <TvDataState
        query={query}
        count={featured.length}
        empty='projects'
        subject='projects'
        level={3}
        className='m-3'
        skeleton={
          <div className='grid gap-3 p-3 @2xl:grid-cols-3'>
            {Array.from({ length: HOME_PROJECTS }, (_, i) => (
              <TvSkeleton key={i} className='h-64' />
            ))}
          </div>
        }
      >
        <ul className='grid gap-3 p-3 @2xl:grid-cols-3'>
          {featured.map((project) => (
            <IdeaCard key={project.id} project={project} skills={skills} />
          ))}
        </ul>
      </TvDataState>
    </ShellWidget>
  );
}
