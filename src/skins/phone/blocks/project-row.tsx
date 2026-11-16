/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronRight } from 'lucide-react';
import { skillsOf } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { metaOf } from '@/skins/phone/blocks/project-model';
import { PROJECT_ROW_FRAME } from '@/skins/phone/blocks/projects-layout';
import { ProjectFeatured } from '@/skins/phone/blocks/project-featured';
import { ProjectStatus } from '@/skins/phone/blocks/project-status';
import { ProjectTags } from '@/skins/phone/blocks/project-tags';
import { ProjectTile } from '@/skins/phone/blocks/project-tile';

/**
 * One project in the list: its tile, name, kind and platforms, whether it goes on, when, and the first technologies. The whole row is the
 * button (the name is the button's name, stretched over the row), so a tap anywhere opens it. On a tablet the open one is marked by a bar at
 * its edge and a deeper surface, on a phone a chevron says the row opens a screen of its own, and pressing it darkens the row.
 */
export function ProjectRow({
  project,
  skills,
  selected,
  onSelect,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
  selected: boolean;
  onSelect: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const { lang } = useLang();
  const tags = skillsOf(project.technologies, skills);
  return (
    <li
      data-projects-part='item'
      data-selected={selected}
      className={cn(
        PROJECT_ROW_FRAME,
        'touch-manipulation transition-[background-color] duration-100 hover:bg-ph-sheet-3/60 active:bg-ph-sheet-3',
        // the bar at the edge is the cue that is not a colour: a shape, with the deeper surface beside it
        '@min-[900px]:data-[selected=true]:bg-ph-accent/12 @min-[900px]:data-[selected=true]:before:absolute @min-[900px]:data-[selected=true]:before:inset-y-0 @min-[900px]:data-[selected=true]:before:left-0 @min-[900px]:data-[selected=true]:before:w-1 @min-[900px]:data-[selected=true]:before:bg-ph-accent @min-[900px]:data-[selected=true]:before:content-[""]',
      )}
    >
      <ProjectTile project={project} />
      <div className='min-w-0 flex-1'>
        <h3 className='text-[17px]/[1.3] font-bold wrap-anywhere'>
          <button
            type='button'
            id={`ph-project-${project.id}`}
            aria-current={selected ? 'true' : undefined}
            onClick={() => onSelect(project)}
            className='cursor-pointer text-left outline-none after:absolute after:inset-0 after:content-[""] focus-visible:after:ring-2 focus-visible:after:ring-ph-accent focus-visible:after:ring-inset'
          >
            {project.name}
          </button>
        </h3>
        <p className='mt-0.5 text-[15px]/[1.4] text-ph-mute'>
          {metaOf(project, copy)}
        </p>
        <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5'>
          {project.highlight !== null && <ProjectFeatured />}
          <ProjectStatus project={project} />
          {project.startMonth && (
            <span className='text-[14px] text-ph-mute'>
              {formatPeriod(project.startMonth, project.endMonth, lang)}
            </span>
          )}
        </div>
        <ProjectTags skills={tags} max={4} className='mt-2.5' />
      </div>
      <ChevronRight
        aria-hidden='true'
        className='size-5 shrink-0 self-center text-ph-mute @min-[900px]:hidden'
      />
    </li>
  );
}
