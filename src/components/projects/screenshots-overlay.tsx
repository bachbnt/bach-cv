/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ImageIcon } from 'lucide-react';
import { MediaBadge } from '@/components/media-badge';
import { fillCopy } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';

/** "6 screenshots" / "1 screenshot", in the visitor's language. */
function useScreenshotsLabel(project: Doc<'projects'>) {
  const copy = useCopy(projectsCopy);
  const count = project.images.length;
  return count === 1
    ? copy.screenshotsOne
    : fillCopy(copy.screenshotsMany, { count });
}

/**
 * The way into a project's screenshots, on its card (featured or not), laid over the cover: tap the cover
 * and a small badge in the corner says so. It needs a `relative` parent the size of the cover.
 */
export function ScreenshotsOverlay({
  project,
  onOpen,
}: {
  project: Doc<'projects'>;
  onOpen: (project: Doc<'projects'>) => void;
}) {
  const label = useScreenshotsLabel(project);
  if (project.images.length === 0) return null;
  return (
    <button
      type='button'
      aria-label={label}
      onClick={() => onOpen(project)}
      className='group/media absolute inset-0 cursor-pointer rounded-xl bg-black/0 outline-offset-2 transition-colors hover:bg-black/10 focus-visible:outline-3 focus-visible:outline-foreground active:bg-black/10'
    >
      <MediaBadge icon={ImageIcon}>{label}</MediaBadge>
    </button>
  );
}
