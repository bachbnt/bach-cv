/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ImageIcon } from 'lucide-react';
import { ProjectCover } from '@/components/projects/project-cover';
import { ProjectLinkItem } from '@/components/projects/project-link-item';
import { ProjectTags } from '@/components/projects/project-tags';
import { fillCopy, skillsOf } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';

/** A large card for a featured project: cover, kind, name, summary, technologies, screenshots and links. */
export function FeaturedProject({
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
    <article className='grid items-center gap-5 rounded-3xl border bg-white p-5 transition-shadow duration-300 hover:shadow-[0_14px_32px_rgba(27,31,39,.1)] min-[721px]:grid-cols-[minmax(0,320px)_minmax(0,1fr)] min-[721px]:gap-8'>
      <ProjectCover
        project={project}
        firstSkill={tags[0]}
        className='h-[260px] rounded-xl'
      />
      <div className='flex min-w-0 flex-col gap-3'>
        <span className='inline-flex self-start rounded-full bg-page-tint px-2.5 py-[3px] text-[13px] font-semibold whitespace-nowrap text-page'>
          {copy.kinds[project.kind]}
        </span>
        <h3 className='text-[28px] leading-[1.1]'>{project.name}</h3>
        {project.summary && (
          <p className='text-base leading-[1.6] text-[#3a404c]'>
            {project.summary}
          </p>
        )}
        <ProjectTags skills={tags} className='mt-4' />
        <div className='mt-1 flex flex-wrap items-center gap-x-5 gap-y-3'>
          {project.images.length > 0 && (
            <button
              type='button'
              onClick={() => onOpenScreenshots(project)}
              className='inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-foreground bg-white px-4 text-[15px] font-semibold whitespace-nowrap transition-colors hover:bg-secondary active:bg-secondary max-[720px]:h-11 pointer-coarse:h-11'
            >
              <ImageIcon className='size-[18px]' aria-hidden='true' />
              {project.images.length === 1
                ? copy.screenshotsOne
                : fillCopy(copy.screenshotsMany, {
                    count: project.images.length,
                  })}
            </button>
          )}
          {project.links.map((link) => (
            <ProjectLinkItem key={link.url} link={link} />
          ))}
        </div>
      </div>
    </article>
  );
}
