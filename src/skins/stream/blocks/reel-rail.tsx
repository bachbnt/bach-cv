/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExternalLink, Images } from 'lucide-react';
import { fillCopy, linkLabel } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';

const circle =
  'grid size-12 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70 pointer-coarse:size-11 [&_svg]:size-6';

/**
 * The buttons on the right of a reel: the project's real actions only. Its screenshots (opens the picture viewer, as the cover does in
 * Standard) and each of its links (a link that leaves the site opens in a new tab). No like or share: Standard has none.
 */
export function ReelRail({
  project,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const count = project.images.length;
  const screenshots =
    count === 1
      ? copy.screenshotsOne
      : fillCopy(copy.screenshotsMany, { count });

  if (count === 0 && project.links.length === 0) return null;
  return (
    <ul className='absolute right-2 bottom-4 m-0 flex list-none flex-col items-center gap-4 p-0'>
      {count > 0 && (
        <li className='flex flex-col items-center gap-1 text-xs font-medium'>
          <button
            type='button'
            aria-label={screenshots}
            onClick={() => onOpenScreenshots(project)}
            className={`${circle} cursor-pointer`}
          >
            <Images aria-hidden='true' />
          </button>
          <span aria-hidden='true'>{count}</span>
        </li>
      )}
      {project.links.map((link) => {
        const label = linkLabel(link, copy.links);
        const external = /^https?:\/\//.test(link.url);
        return (
          <li
            key={link.url}
            className='flex max-w-16 flex-col items-center gap-1 text-center text-[11px]/[1.15] font-medium'
          >
            <a
              href={link.url}
              aria-label={label}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className={circle}
            >
              <ExternalLink aria-hidden='true' />
            </a>
            <span aria-hidden='true' className='line-clamp-2 break-words'>
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
