/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { DevExperienceRowSkeleton } from '@/skins/dev/blocks/experience-row-skeleton';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';

/** What each role measures once loaded (the open first one with its list, then the ones with a picture), per width of the shell. */
const ROW_HEIGHTS = [
  'h-[1306px] max-[1279px]:h-[3268px] max-[900px]:h-[1188px] max-[620px]:h-[2446px] max-[359px]:h-[3530px]',
  'h-[296px] max-[1279px]:h-[476px] max-[900px]:h-[477px] max-[620px]:h-[626px] max-[359px]:h-[695px]',
  'h-[224px] max-[1279px]:h-[354px] max-[900px]:h-[425px] max-[620px]:h-[450px] max-[359px]:h-[489px]',
  'h-[265px] max-[1279px]:h-[411px] max-[900px]:h-[476px] max-[620px]:h-[532px] max-[359px]:h-[600px]',
];

/** The roles of the Source Control graph: the bordered box and the four rows of the loaded page, as blank shapes. */
export function DevExperienceSkeleton() {
  return (
    <DevSkeleton className='py-1'>
      {ROW_HEIGHTS.map((height, i) => (
        <DevExperienceRowSkeleton
          key={height}
          open={i === 0}
          className={height}
          data-skeleton={i === 0 ? 'item' : undefined}
        />
      ))}
    </DevSkeleton>
  );
}
