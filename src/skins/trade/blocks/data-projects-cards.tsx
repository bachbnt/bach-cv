/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ImageIcon } from 'lucide-react';
import type { RefObject } from 'react';
import { ProjectCover } from '@/components/projects/project-cover';
import { skillsOf } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DataKind } from '@/skins/trade/blocks/data-kind';
import { DataTags } from '@/skins/trade/blocks/data-tags';
import type { Density } from '@/skins/trade/blocks/data-projects-model';
import { ProjectLinks } from '@/skins/trade/blocks/project-links';
import { screenshotsLabel } from '@/skins/trade/blocks/screenshots-label';
import { TvChip } from '@/skins/trade/ui/tv-chip';
import { cssVars } from '@/skins/trade/ui/css-vars';

/** The projects as ideas of a chart site: a card each, with the cover on top (it opens the screenshots), the name, the summary, the tags and the links. */
export function DataProjectsCards({
  projects,
  skills,
  density,
  onOpenScreenshots,
  listRef,
}: {
  projects: Doc<'projects'>[];
  skills: Map<string, Doc<'skills'>>;
  density: Density;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
  listRef: RefObject<HTMLDivElement | null>;
}) {
  const comfy = density === 'comfortable';
  return (
    <div
      ref={listRef}
      className={cn(
        'grid gap-3 p-3.5',
        comfy
          ? 'grid-cols-[repeat(auto-fill,minmax(min(100%,290px),1fr))]'
          : 'grid-cols-[repeat(auto-fill,minmax(min(100%,230px),1fr))]',
      )}
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          skills={skills}
          comfy={comfy}
          index={index}
          onOpenScreenshots={onOpenScreenshots}
        />
      ))}
    </div>
  );
}

function ProjectCard({
  project,
  skills,
  comfy,
  index,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
  comfy: boolean;
  index: number;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const { projects: words } = useCopy(tradeDataCopy);
  const tags = skillsOf(project.technologies, skills);
  const label = screenshotsLabel(project.images.length, copy);
  return (
    <article
      data-flip={project.id}
      data-testid='project'
      style={cssVars({ '--i': Math.min(index, 8) })}
      className='group/card flex animate-tv-fade-up flex-col overflow-hidden rounded-md border border-tv-line bg-tv-panel transition-[translate,border-color,box-shadow] duration-160 [animation-delay:calc(var(--i)*35ms)] hover:-translate-y-0.5 hover:border-tv-accent hover:shadow-tv-card active:translate-y-0'
    >
      <div className='relative overflow-hidden'>
        <ProjectCover
          project={project}
          firstSkill={tags[0]}
          className={cn(
            'rounded-none text-4xl transition-transform duration-300 ease-tv-out group-hover/card:scale-105',
            comfy ? 'h-[150px]' : 'h-[96px]',
          )}
        />
        {project.images.length > 0 && (
          <button
            type='button'
            aria-label={label}
            onClick={() => onOpenScreenshots(project)}
            className='absolute inset-0 flex cursor-zoom-in items-end justify-end bg-black/0 p-2 transition-colors duration-100 hover:bg-black/15 active:bg-black/15'
          >
            <span
              aria-hidden='true'
              className='inline-flex items-center gap-1 rounded bg-tv-night/80 px-1.5 py-0.5 text-[11px] font-medium text-white'
            >
              <ImageIcon className='size-3' />
              {project.images.length}
            </span>
          </button>
        )}
      </div>
      <div className='flex flex-1 flex-col gap-2 p-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <DataKind kind={project.kind} />
          {project.highlight !== null && (
            <TvChip tone='gold'>
              {copy.featuredTag} {fill(words.rank, { rank: project.highlight })}
            </TvChip>
          )}
        </div>
        <h3 className='text-[13px] leading-snug font-semibold'>
          {project.name}
        </h3>
        {project.summary && (
          <p
            className={cn(
              'text-xs/[1.5] text-tv-mute',
              comfy ? 'line-clamp-4' : 'line-clamp-2',
            )}
          >
            {project.summary}
          </p>
        )}
        <DataTags skills={tags} />
        <div className='mt-auto pt-1'>
          <ProjectLinks links={project.links} />
        </div>
      </div>
    </article>
  );
}
