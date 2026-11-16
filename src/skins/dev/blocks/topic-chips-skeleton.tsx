/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { DevSkeletonBar } from '@/skins/dev/ui/dev-skeleton-bar';

/** The topic chips of the contact section while the services load (one chip for each service of a typical page). */
export function TopicChipsSkeleton() {
  return (
    <div className='my-4 flex flex-wrap gap-2' aria-hidden='true'>
      {['w-[145px]', 'w-[145px]', 'w-[114px]', 'w-[184px]', 'w-[122px]'].map(
        (width, n) => (
          <DevSkeletonBar key={n} className={`h-[39px] ${width}`} />
        ),
      )}
    </div>
  );
}
