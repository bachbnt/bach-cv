/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ProjectCover } from '@/components/projects/project-cover';
import { ProjectLinkItem } from '@/components/projects/project-link-item';
import { ProjectTags } from '@/components/projects/project-tags';
import { ScreenshotsOverlay } from '@/components/projects/screenshots-overlay';
import { skillsOf } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from 'cn';

/** One project in the "All projects" grid. */
export function ProjectCard({
  project,
  skills,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const tags = skillsOf(project.technologies, skills);
  return (
    <article className='glow lift flex flex-col gap-2.5 rounded-2xl border bg-card px-4 pt-4 pb-7'>
      <div className='group/cover relative'>
        {/* the picture zooms a little under the mouse, inside its own frame (the focus ring of the button stays whole) */}
        <div className='overflow-hidden rounded-xl'>
          <ProjectCover
            project={project}
            firstSkill={tags[0]}
            className={cn(
              'h-[220px] rounded-xl',
              project.images.length > 0 &&
                'transition-transform duration-[600ms] ease-out motion-safe:group-hover/cover:scale-[1.05] motion-reduce:transition-none',
            )}
          />
        </div>
        <ScreenshotsOverlay project={project} onOpen={onOpenScreenshots} />
      </div>
      <div className='mt-2 flex items-center gap-2'>
        <span className='inline-flex rounded-full bg-page-tint px-2.5 py-[3px] text-[13px] font-semibold whitespace-nowrap text-page'>
          {copy.kinds[project.kind]}
        </span>
        {project.highlight !== null && (
          <span className='inline-flex rounded-full bg-night px-2.5 py-[3px] text-[13px] font-semibold text-white'>
            {copy.featuredTag}
          </span>
        )}
      </div>
      <h3 className='text-[22px] leading-[1.2]'>{project.name}</h3>
      {project.summary && (
        <p className='line-clamp-3 text-base leading-[1.55] text-body'>
          {project.summary}
        </p>
      )}
      <ProjectTags skills={tags} className='mt-4' />
      {project.links.length > 0 && (
        <div className='mt-auto flex flex-wrap gap-x-5 pt-4'>
          {project.links.map((link) => (
            <ProjectLinkItem key={link.url} link={link} />
          ))}
        </div>
      )}
    </article>
  );
}
