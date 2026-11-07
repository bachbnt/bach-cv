/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ImageIcon, Star } from 'lucide-react';
import { ProjectCover } from '@/components/projects/project-cover';
import { fillCopy } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { ProjectKind } from '@/skins/moba/blocks/projects-kind';
import { ProjectLinks } from '@/skins/moba/blocks/projects-links';
import { MbChip } from '@/skins/moba/ui/mb-chip';

/**
 * One project as an objective card: the cover is the banner (with a way into the screenshots), the kind is the type of the objective, the
 * technologies are the loot (tinted by skill category) and the links are the actions. `big` is the featured layout, the cover beside the text
 * when the room allows (the parent is a container).
 */
export function ProjectCard({
  project,
  skills,
  big = false,
  marked = false,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  skills: Doc<'skills'>[];
  big?: boolean;
  /** show the Featured tag (a featured project in the list of all projects) */
  marked?: boolean;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const count = project.images.length;
  const label =
    count === 1
      ? copy.screenshotsOne
      : fillCopy(copy.screenshotsMany, { count });
  return (
    <article
      data-testid='project'
      className={cn(
        'mb-plaque flex h-full flex-col gap-3 p-2',
        big &&
          '@[640px]:grid @[640px]:grid-cols-[minmax(0,300px)_minmax(0,1fr)] @[640px]:gap-5',
      )}
    >
      <div className='group/cover relative'>
        <div
          className={cn(
            'relative overflow-hidden bg-mb-well',
            big && '@[640px]:h-full',
          )}
        >
          <ProjectCover
            project={project}
            firstSkill={skills[0]}
            className={cn(
              'transition-transform duration-500 ease-out motion-reduce:transition-none motion-safe:group-hover/cover:scale-[1.05]',
              big
                ? 'h-[210px] @[640px]:h-full @[640px]:min-h-[250px]'
                : 'h-[180px]',
            )}
          />
          <span
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-mb-raised/85 to-transparent'
          />
        </div>
        {count > 0 && (
          <button
            type='button'
            aria-label={label}
            onClick={() => onOpenScreenshots(project)}
            className='group/media absolute inset-0 cursor-pointer'
          >
            <span
              aria-hidden='true'
              className='mb-chip absolute right-2 bottom-2 inline-flex items-center gap-1.5 bg-mb-void/90 px-3 py-2 text-[12px] leading-none font-bold text-mb-gold-ink transition-transform group-hover/media:-translate-y-0.5 motion-reduce:transition-none'
            >
              <ImageIcon className='size-3.5' />
              {label}
            </span>
          </button>
        )}
      </div>
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-3 px-2 pb-2',
          big && '@[640px]:justify-center @[640px]:py-2',
        )}
      >
        <div className='flex flex-wrap items-center gap-2'>
          <ProjectKind kind={project.kind} />
          {marked && project.highlight !== null && (
            <MbChip tone='teal'>
              <Star aria-hidden='true' className='size-3.5' />
              {copy.featuredTag}
            </MbChip>
          )}
        </div>
        <h3
          className={cn(
            'leading-[1.15] text-mb-gold-ink',
            big ? 'text-[28px]' : 'text-[22px]',
          )}
        >
          {project.name}
        </h3>
        {project.summary && (
          <p
            className={cn(
              'text-[14.5px] leading-[1.55] text-mb-mute',
              !big && 'line-clamp-3',
            )}
          >
            {project.summary}
          </p>
        )}
        {skills.length > 0 && (
          <ul
            aria-label={copy.technologies}
            className='m-0 flex list-none flex-wrap gap-1.5 p-0'
          >
            {skills.map((skill) => (
              <li key={skill.id}>
                <MbChip tone={skill.category}>{skill.name}</MbChip>
              </li>
            ))}
          </ul>
        )}
        {project.links.length > 0 && (
          <div className='mt-auto pt-1'>
            <ProjectLinks links={project.links} />
          </div>
        )}
      </div>
    </article>
  );
}
