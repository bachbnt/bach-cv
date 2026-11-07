/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ImageIcon } from 'lucide-react';
import { ProjectCover } from '@/components/projects/project-cover';
import { skillsOf } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { DataKind } from '@/skins/trade/blocks/data-kind';
import { DataTags } from '@/skins/trade/blocks/data-tags';
import { ProjectLinks } from '@/skins/trade/blocks/project-links';
import { screenshotsLabel } from '@/skins/trade/blocks/screenshots-label';
import { TvChip } from '@/skins/trade/ui/tv-chip';

/**
 * Everything about a project, whatever columns are shown: the cover, the kind and the featured mark, the summary, all the technologies,
 * the links and the way into the screenshots. It is what a row opens to and what a heatmap tile opens.
 */
export function DataProjectDetail({
  project,
  skills,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const { projects } = useCopy(tradeDataCopy);
  const tags = skillsOf(project.technologies, skills);
  return (
    <div className='grid gap-3.5 px-3.5 py-3.5 min-[701px]:grid-cols-[170px_minmax(0,1fr)]'>
      <ProjectCover
        project={project}
        firstSkill={tags[0]}
        className='h-[104px] rounded text-3xl'
      />
      <div className='grid min-w-0 content-start gap-2.5'>
        <div className='flex flex-wrap items-center gap-2'>
          <DataKind kind={project.kind} />
          {project.highlight !== null && (
            <TvChip tone='gold'>
              {copy.featuredTag}{' '}
              {fill(projects.rank, { rank: project.highlight })}
            </TvChip>
          )}
        </div>
        {project.summary && (
          <p className='max-w-[680px] text-[13px]/[1.55]'>{project.summary}</p>
        )}
        <DataTags skills={tags} />
        {(project.links.length > 0 || project.images.length > 0) && (
          <div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
            <ProjectLinks links={project.links} />
            {project.images.length > 0 && (
              <button
                type='button'
                onClick={() => onOpenScreenshots(project)}
                className='inline-flex cursor-pointer items-center gap-1.5 font-medium text-tv-accent-ink underline-offset-[3px] hover:underline pointer-coarse:min-h-11'
              >
                <ImageIcon aria-hidden='true' className='size-3.5' />
                {screenshotsLabel(project.images.length, copy)}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
