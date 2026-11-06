/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { skillsOf } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { ProjectLinks } from '@/skins/dev/blocks/project-links';
import { ProjectTags } from '@/skins/dev/blocks/project-tags';
import { DevKind } from '@/skins/dev/ui/dev-kind';

/** The text side of a project card: kind (plus any extra badge in `children`), name, summary, technologies and links. */
export function ProjectBody({
  project,
  skills,
  featured = false,
  children,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
  /** the large card of a featured project (the text sits in the middle of its side); in the grid the links stay at the bottom */
  featured?: boolean;
  children?: ReactNode;
}) {
  const copy = useCopy(projectsCopy);
  return (
    <div
      className={cn(
        'px-4 pt-3.5 pb-4',
        featured ? 'min-w-0 self-center' : 'flex flex-1 flex-col',
      )}
    >
      <div className='flex flex-wrap items-center gap-1.5'>
        <DevKind>{copy.kinds[project.kind]}</DevKind>
        {children}
      </div>
      <h3
        className={cn(
          'text-sky wrap-anywhere',
          featured ? 'text-[26px]' : 'text-[20px]',
        )}
      >
        {project.name}
      </h3>
      {project.summary && (
        <p
          className={cn(
            'mt-1.5 mb-1 text-[14.5px] text-mute',
            !featured && 'line-clamp-4',
          )}
        >
          {project.summary}
        </p>
      )}
      <ProjectTags skills={skillsOf(project.technologies, skills)} />
      <ProjectLinks
        links={project.links}
        className={featured ? undefined : 'mt-auto pt-3'}
      />
    </div>
  );
}
