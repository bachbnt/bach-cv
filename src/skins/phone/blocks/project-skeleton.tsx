/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  PROJECT_LIST_CARD,
  PROJECT_ROW_FRAME,
  PROJECTS_GRID,
} from '@/skins/phone/blocks/projects-layout';
import { ProjectsPane } from '@/skins/phone/blocks/projects-pane';
import { useWideScreen } from '@/skins/phone/blocks/use-wide-screen';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';

/**
 * The rows of the list as the seed has them, in the order of "Featured first": whether the project is featured (a chip more, which can make
 * the period wrap) and how long its period is (a long one wraps under the chips on a phone) and the widths of its technologies (which can wrap to a second line). The rows of the loaded page are not all alike, so
 * neither are these, and the list ends where the loaded one would not end early.
 */
const ROWS: { featured: boolean; long: boolean; tags: string[] }[] = [
  { featured: true, long: true, tags: ['w-16', 'w-[4.5rem]'] },
  {
    featured: true,
    long: true,
    tags: ['w-16', 'w-[4.75rem]', 'w-[3.25rem]', 'w-[4.5rem]'],
  },
  {
    featured: true,
    long: true,
    tags: ['w-14', 'w-[4.25rem]', 'w-16', 'w-[3.75rem]'],
  },
  { featured: true, long: true, tags: ['w-[4.25rem]', 'w-[3.25rem]'] },
  {
    featured: false,
    long: true,
    tags: ['w-[4.75rem]', 'w-[4.25rem]', 'w-[5.25rem]', 'w-[4.75rem]', 'w-9'],
  },
  {
    featured: false,
    long: false,
    tags: ['w-[3.75rem]', 'w-[3.25rem]', 'w-[6.5rem]', 'w-[3.75rem]'],
  },
  {
    featured: false,
    long: true,
    tags: ['w-16', 'w-[3.25rem]', 'w-20', 'w-[3.25rem]'],
  },
  {
    featured: false,
    long: false,
    tags: ['w-16', 'w-[4.25rem]', 'w-14', 'w-[4.75rem]', 'w-16', 'w-[4.5rem]'],
  },
  {
    featured: false,
    long: false,
    tags: ['w-[4.5rem]', 'w-14', 'w-[4.25rem]', 'w-16'],
  },
  {
    featured: false,
    long: true,
    tags: ['w-[4.5rem]', 'w-16', 'w-20', 'w-[4.25rem]', 'w-[3.75rem]'],
  },
];

/** A row of the list before its project arrives: the tile, the name, the kind, the chips (featured, status, period: the room of the status chip is kept) and the technologies. */
function RowSkeleton({
  row,
  first,
}: {
  row: (typeof ROWS)[number];
  first: boolean;
}) {
  return (
    <li
      data-skeleton={first ? 'item' : undefined}
      className={PROJECT_ROW_FRAME}
    >
      <PhSkeleton className='size-12 shrink-0 rounded-ph-inner' />
      <div className='min-w-0 flex-1'>
        <PhSkeleton className='h-[22px] w-2/5' />
        <PhSkeleton className='mt-0.5 h-[21px] w-3/5' />
        <div className='mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5'>
          {row.featured && <PhSkeleton className='h-7 w-24' />}
          <PhSkeleton className='h-7 w-[6.25rem]' />
          <PhSkeleton
            className={`h-[21px] ${row.long ? 'w-[9.5rem]' : 'w-20'}`}
          />
        </div>
        <div className='mt-2.5 flex flex-wrap gap-1.5'>
          {row.tags.map((width, i) => (
            <PhSkeleton key={i} className={`h-7 ${width}`} />
          ))}
        </div>
      </div>
    </li>
  );
}

/** The open project before it arrives: the head with the tile and the chip, the cover, the summary, the facts, the links and the technologies. */
function DetailSkeleton() {
  return (
    <div className='flex flex-col'>
      <div className='flex items-start gap-4'>
        <PhSkeleton className='size-14 shrink-0 rounded-ph-inner' />
        <div className='min-w-0 flex-1'>
          <PhSkeleton className='h-[29px] w-3/5' />
          <PhSkeleton className='mt-1 h-[21px] w-4/5' />
          <PhSkeleton className='mt-2 h-7 w-24' />
        </div>
      </div>
      <PhSkeleton className='mt-6 aspect-[2/1] w-full rounded-ph-inner' />
      <div className='mt-5 space-y-2'>
        <PhSkeleton className='h-4 w-full' />
        <PhSkeleton className='h-4 w-4/5' />
      </div>
      <div className='mt-5 divide-y divide-ph-line overflow-hidden rounded-ph-inner border border-ph-line'>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className='flex h-[3.1rem] items-center gap-6 px-4'>
            <PhSkeleton className='h-4 w-16' />
            <PhSkeleton className={i === 2 ? 'h-7 w-20' : 'h-4 w-32'} />
          </div>
        ))}
      </div>
      <PhSkeleton className='mt-7 mb-2.5 h-[13px] w-16' />
      <PhSkeleton className='h-11 w-32' />
      <PhSkeleton className='mt-7 mb-2.5 h-[13px] w-28' />
      <div className='flex gap-1.5'>
        <PhSkeleton className='h-7 w-16' />
        <PhSkeleton className='h-7 w-20' />
        <PhSkeleton className='h-7 w-14' />
      </div>
    </div>
  );
}

/**
 * The page before the projects arrive, drawn on the same grid as the loaded one so that nothing moves when they do: the count line, the search
 * field with the two round buttons, the card of ten rows, and, from 900 px, the card of the open project with the shape of its detail.
 */
export function ProjectSkeleton() {
  const wide = useWideScreen();
  return (
    <div aria-hidden='true' className={PROJECTS_GRID}>
      <div className='min-w-0'>
        <div data-skeleton='toolbar'>
          <div className='mb-3 px-1'>
            <PhSkeleton className='h-[22.5px] w-44' />
          </div>
          <div className='flex items-center gap-2.5'>
            <PhSkeleton className='h-12 min-w-0 flex-1' />
            <PhSkeleton className='size-12 shrink-0' />
            <PhSkeleton className='size-12 shrink-0' />
          </div>
        </div>
        <div className='mt-5'>
          <ol className={PROJECT_LIST_CARD}>
            {ROWS.map((row, i) => (
              <RowSkeleton key={i} row={row} first={i === 0} />
            ))}
          </ol>
        </div>
      </div>
      {wide && (
        <ProjectsPane skeleton>
          <DetailSkeleton />
        </ProjectsPane>
      )}
    </div>
  );
}
