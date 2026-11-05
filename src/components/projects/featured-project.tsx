/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ProjectCover } from '@/components/projects/project-cover';
import { ProjectLinkItem } from '@/components/projects/project-link-item';
import { ProjectTags } from '@/components/projects/project-tags';
import { skillsOf } from '@/components/projects/project-helpers';
import { ScreenshotsOverlay } from '@/components/projects/screenshots-overlay';
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
      <div className='relative'>
        <ProjectCover
          project={project}
          firstSkill={tags[0]}
          className='h-[260px] rounded-xl'
        />
        <ScreenshotsOverlay project={project} onOpen={onOpenScreenshots} />
      </div>
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
        {project.links.length > 0 && (
          <div className='mt-1 flex flex-wrap gap-x-5 gap-y-3'>
            {project.links.map((link) => (
              <ProjectLinkItem key={link.url} link={link} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
