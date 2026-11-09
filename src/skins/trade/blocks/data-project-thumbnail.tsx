/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { screenshotsLabel } from '@/components/projects/project-helpers';
import { ProjectCover } from '@/components/projects/project-cover';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

export function Thumbnail({
  project,
  firstSkill,
  comfy,
  duplicated,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  firstSkill?: Doc<'skills'>;
  comfy: boolean;
  /** the Screenshots column is shown, so this cover is only a bigger target for the mouse */
  duplicated: boolean;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const cover = (
    <ProjectCover
      project={project}
      firstSkill={firstSkill}
      className={cn(
        'rounded text-xs',
        comfy ? 'h-11 w-16' : 'h-7 w-10 text-[10px]',
      )}
    />
  );
  if (project.images.length === 0)
    return <div className='flex-none overflow-hidden rounded'>{cover}</div>;
  return (
    <button
      type='button'
      aria-label={screenshotsLabel(project.images.length, copy)}
      aria-hidden={duplicated || undefined}
      tabIndex={duplicated ? -1 : undefined}
      onClick={() => onOpenScreenshots(project)}
      className='flex-none cursor-zoom-in overflow-hidden rounded transition-transform duration-100 hover:scale-105 active:scale-95 pointer-coarse:min-h-11'
    >
      {cover}
    </button>
  );
}
