/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { screenshotsLabel } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { COVER } from '@/skins/dev/blocks/cover-styles';
import { ProjectCoverArt } from '@/skins/dev/blocks/project-cover-art';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { DevBadge } from '@/skins/dev/ui/dev-badge';

/**
 * The cover of a project card. With screenshots it is the button that opens them (named "6 screenshots", with the count in a
 * badge); without, it is just the picture.
 */
export function ProjectCover({
  project,
  firstSkill,
  featured = false,
  onOpen,
}: {
  project: Doc<'projects'>;
  firstSkill?: Doc<'skills'>;
  /** the large card: the cover fills the height of its side */
  featured?: boolean;
  onOpen: () => void;
}) {
  const copy = useCopy(projectsCopy);
  const frame = cn(
    COVER,
    featured && 'aspect-auto h-full min-h-[260px] border-r border-b-0',
  );
  if (project.images.length === 0) {
    return (
      <div data-slot='dev-cover' className={cn(frame, 'cursor-default')}>
        <ProjectCoverArt project={project} firstSkill={firstSkill} />
      </div>
    );
  }
  const label = screenshotsLabel(project.images.length, copy);
  return (
    <button
      type='button'
      data-slot='dev-cover'
      className={frame}
      aria-label={label}
      onClick={onOpen}
    >
      <ProjectCoverArt project={project} firstSkill={firstSkill} />
      <DevBadge aria-hidden='true'>
        <DevIcon name='file-media' /> {label}
      </DevBadge>
    </button>
  );
}
