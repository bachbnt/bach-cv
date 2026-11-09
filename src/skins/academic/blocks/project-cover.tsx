/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { fillCopy } from '@/components/projects/project-helpers';
import { academicProjectsCopy } from '@/content/copy/academic-projects';
import { projectsCopy } from '@/content/copy/projects';
import { initialsOf } from '@/lib/derive/initials';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/** The tile that stands in for a missing cover, tinted by the category of the first technology (chalk colours). */
const TILE: Record<Doc<'skills'>['category'], string> = {
  mobile: 'bg-ac-b2/35',
  web: 'bg-ac-b1/35',
  ai: 'bg-ac-mb/30',
  tools: 'bg-ac-b3/35',
};

/**
 * The cover of a project: a figure taped to the board (a little crooked, the other way for the next one) with its number and name in
 * chalk under it. A cover with screenshots is also a mouse target for opening them; the button of the entry is the one for the keyboard and
 * for assistive technology, so this one is hidden from both.
 */
export function ProjectCover({
  project,
  firstSkill,
  number,
  taped = false,
  onOpen,
}: {
  project: Doc<'projects'>;
  firstSkill?: Doc<'skills'>;
  number: number;
  taped?: boolean;
  onOpen?: () => void;
}) {
  const copy = useCopy(projectsCopy);
  const own = useCopy(academicProjectsCopy);
  return (
    <figure
      className={cn(
        'relative m-0 mt-2 max-w-[320px]',
        number % 2 === 0 ? '-rotate-[1.6deg]' : 'rotate-[1.4deg]',
        taped && 'ac-tape',
      )}
    >
      <div className='relative aspect-[16/10] overflow-hidden border-[6px] border-ac-polaroid bg-ac-polaroid shadow-[0_6px_14px_rgba(0,0,0,0.38)]'>
        {project.cover ? (
          <Image
            src={project.cover}
            alt={fillCopy(copy.coverAlt, { name: project.name })}
            fill
            sizes='(min-width: 900px) 184px, 320px'
            className='object-cover object-top'
          />
        ) : (
          <div
            aria-hidden='true'
            className={cn(
              'flex size-full items-center justify-center font-ac-chalk text-[44px]/none text-ac-sheet-ink',
              firstSkill ? TILE[firstSkill.category] : 'bg-ac-faint',
            )}
          >
            {initialsOf(project.name)}
          </div>
        )}
        {onOpen && project.images.length > 0 && (
          <button
            type='button'
            aria-hidden='true'
            tabIndex={-1}
            onClick={onOpen}
            className='absolute inset-0 cursor-zoom-in bg-transparent'
          />
        )}
      </div>
      <figcaption className='mt-2 font-ac-note text-[16px]/[1.25] text-ac-mute'>
        <b className='font-normal text-ac-md'>
          {fillCopy(own.figure, { n: number })}
        </b>{' '}
        {project.name}
      </figcaption>
    </figure>
  );
}
