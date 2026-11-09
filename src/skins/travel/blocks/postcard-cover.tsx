/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Camera } from 'lucide-react';
import Image from 'next/image';
import { fillCopy } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { initialsOf } from '@/lib/derive/initials';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { screenshotsLabel } from '@/skins/travel/blocks/screenshots-label';
import {
  STOP_OF_CATEGORY,
  stopClass,
} from '@/skins/travel/blocks/postcard-model';

/** The picture of a postcard: the project's cover, or (when it has none) a drawn view tinted by the category of its first technology, with the initials. */
function CoverView({
  project,
  firstSkill,
}: {
  project: Doc<'projects'>;
  firstSkill?: Doc<'skills'>;
}) {
  const copy = useCopy(projectsCopy);
  if (project.cover)
    return (
      <Image
        src={project.cover}
        alt={fillCopy(copy.coverAlt, { name: project.name })}
        fill
        sizes='(max-width: 767px) 100vw, 260px'
        className='object-cover object-top'
      />
    );
  const stop = firstSkill ? STOP_OF_CATEGORY[firstSkill.category] : 2;
  return (
    <span
      aria-hidden='true'
      className={cn(
        stopClass(stop),
        'absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,color-mix(in_srgb,var(--tl-pc)_30%,var(--tl-paper))_0%,color-mix(in_srgb,var(--tl-pc)_55%,var(--tl-paper))_100%)] text-[44px] font-extrabold tracking-[-0.03em] text-tl-paper-ink',
      )}
    >
      <svg
        viewBox='0 0 160 100'
        preserveAspectRatio='none'
        className='absolute inset-x-0 bottom-0 h-1/2 w-full'
      >
        <path
          d='M0 100V58q30-30 60-6t50-14q30-20 50 8v54z'
          fill='var(--tl-pc)'
          opacity='0.45'
        />
        <path
          d='M0 100V76q40-24 80-4t80-10v38z'
          fill='var(--tl-pc)'
          opacity='0.7'
        />
      </svg>
      <span className='relative'>{initialsOf(project.name)}</span>
    </span>
  );
}

/**
 * The photo of a postcard. With screenshots the whole photo is the button that opens them (named "6 screenshots", like Standard,
 * with the count in a badge); without, it is just the picture. The frame has a reserved ratio, so nothing jumps while it loads.
 */
export function PostcardCover({
  project,
  firstSkill,
  onOpen,
}: {
  project: Doc<'projects'>;
  firstSkill?: Doc<'skills'>;
  onOpen: () => void;
}) {
  const copy = useCopy(projectsCopy);
  const frame =
    'relative block aspect-[8/5] w-full overflow-hidden rounded-lg bg-tl-paper-tag';
  if (project.images.length === 0)
    return (
      <div className={frame}>
        <CoverView project={project} firstSkill={firstSkill} />
      </div>
    );
  const label = screenshotsLabel(project.images.length, copy);
  return (
    <button
      type='button'
      aria-label={label}
      onClick={onOpen}
      className={cn(frame, 'tl-cover cursor-pointer')}
    >
      <CoverView project={project} firstSkill={firstSkill} />
      <span
        aria-hidden='true'
        className='absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-tl-paper px-2.5 py-1 text-[11.5px] font-bold text-tl-paper-ink shadow-tl-tag'
      >
        <Camera className='size-3.5' />
        {label}
      </span>
    </button>
  );
}
