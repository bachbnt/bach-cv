/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { chapterTime } from '@/skins/stream/config';

/**
 * Under the reel of a phone, the projects of the list as the chapters of a video: tap one to go to it, without stepping past the others.
 * The open one is marked. The time of a chapter is decoration (`chapterTime`, as on Home). From 701px the reel has room beside it for the
 * buttons and this list is not needed.
 */
export function ChannelReelChapters({
  projects,
  index,
  onSelect,
}: {
  projects: Doc<'projects'>[];
  index: number;
  onSelect: (index: number) => void;
}) {
  const copy = useCopy(projectsCopy);
  if (projects.length < 2) return null;
  return (
    <div className='w-full min-[701px]:hidden'>
      <p id='reel-chapters-h' className='mb-1 text-sm font-medium'>
        {copy.all}
      </p>
      <ol
        aria-labelledby='reel-chapters-h'
        className='m-0 flex list-none flex-col p-0'
      >
        {projects.map((project, i) => (
          <li key={project.id}>
            <button
              type='button'
              aria-current={i === index ? 'true' : undefined}
              onClick={() => onSelect(i)}
              className={cn(
                'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-2 text-left text-sm transition-colors hover:bg-sm-hover',
                i === index && 'bg-sm-hover font-medium',
              )}
            >
              <span
                aria-hidden='true'
                className={cn(
                  'w-9 flex-none text-xs text-sm-mute tabular-nums',
                  i === index && 'text-sm-blue',
                )}
              >
                {chapterTime(i)}
              </span>
              <span className='min-w-0 truncate'>{project.name}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
