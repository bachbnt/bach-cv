/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { fill } from '@/lib/chat/fill';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';

/** The screenshots of a project as a strip you swipe along; a tap opens the viewer at that picture. Every frame keeps its shape while the picture loads. */
export function ProjectScreenshotStrip({
  project,
  onOpen,
}: {
  project: Doc<'projects'>;
  onOpen: (index: number) => void;
}) {
  const copy = useCopy(projectsCopy);
  return (
    <ul className='m-0 -mx-1 flex list-none snap-x scroll-px-1 gap-3 overflow-x-auto overscroll-x-contain p-1 pb-2 [scrollbar-width:thin]'>
      {project.images.map((src, index) => {
        const alt = fill(copy.dialog.alt, {
          name: project.name,
          current: index + 1,
        });
        return (
          <li key={src} className='shrink-0 snap-start'>
            <button
              type='button'
              aria-label={alt}
              onClick={() => onOpen(index)}
              className='relative block aspect-[3/4] h-48 cursor-zoom-in overflow-hidden rounded-ph-inner bg-ph-sheet-3 transition-[scale] duration-100 active:scale-[0.97]'
            >
              <Image
                src={src}
                alt=''
                fill
                sizes='144px'
                className='object-cover object-top'
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
