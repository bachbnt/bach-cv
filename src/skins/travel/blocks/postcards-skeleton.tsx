/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { PostcardSkeleton } from '@/skins/travel/blocks/postcard-skeleton';
import { ProjectsToolbarSkeleton } from '@/skins/travel/blocks/projects-toolbar-skeleton';

/** What the strip typically holds. */
const POSTCARDS = 10;

/** The control row and the strip of postcards (a row that is cut off at the edge, or a column on a phone), laid out as the loaded ones. */
export function PostcardsSkeleton() {
  return (
    <>
      <ProjectsToolbarSkeleton />
      <div className='m-0 flex flex-col gap-4 md:-mx-2 md:flex-row md:overflow-hidden md:px-2 md:py-4'>
        {Array.from({ length: POSTCARDS }, (_, n) => (
          <PostcardSkeleton key={n} first={n === 0} />
        ))}
      </div>
    </>
  );
}
