/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import { PROJECT_ENTRY_ITEM } from '@/skins/academic/blocks/project-entry';
import { ProjectSkeletonEntry } from '@/skins/academic/blocks/project-skeleton-entry';
import { AcRow } from '@/skins/academic/ui/ac-note';
import { AcHeading } from '@/skins/academic/ui/ac-section';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';

const FEATURED = 4;
const ALL = 10;

/**
 * The page as it will be: the two headings are real, then the featured entries, the line of controls and the entries of the list, with the
 * grid, the margin notes and the sizes of the loaded ones.
 */
export function ProjectSkeleton() {
  const copy = useCopy(projectsCopy);
  return (
    <>
      <section>
        <AcHeading className='mt-6 mb-5'>{copy.featured}</AcHeading>
        <ol className='m-0 list-none p-0'>
          {Array.from({ length: FEATURED }, (_, i) => (
            <li
              key={i}
              data-skeleton={i === 0 ? 'item' : undefined}
              className={PROJECT_ENTRY_ITEM}
            >
              <ProjectSkeletonEntry featured long={i > 0} />
            </li>
          ))}
        </ol>
      </section>
      <section>
        <AcHeading className='mt-14 mb-1'>{copy.all}</AcHeading>
        <div data-skeleton='toolbar' aria-hidden='true' className='mt-4'>
          <AcRow tone='a' note={<AcSkeleton className='h-[30px] w-40' />}>
            <div className='flex flex-wrap items-end gap-x-4 gap-y-3'>
              <AcSkeleton className='h-[37px] max-w-[300px] min-w-[200px] flex-1' />
              <AcSkeleton className='h-[34px] w-[98px]' />
              <AcSkeleton className='h-[34px] w-[117px]' />
            </div>
          </AcRow>
        </div>
        <ol className='m-0 mt-6 list-none p-0'>
          {Array.from({ length: ALL }, (_, i) => (
            <li key={i} className={PROJECT_ENTRY_ITEM}>
              <ProjectSkeletonEntry featured={false} long={i > 0} />
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
