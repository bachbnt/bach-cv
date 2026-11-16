/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ResumeRoleSkeleton } from '@/skins/academic/blocks/resume-role-skeleton';

/** What the seed has: the roles of the Experience section. */
const ROLES = 4;

/** The roles of the Experience section that are not written yet, as far from the heading as the loaded ones. */
export function ResumeExperienceSkeleton() {
  return (
    <div className='mt-4'>
      {Array.from({ length: ROLES }, (_, i) => (
        <ResumeRoleSkeleton key={i} first={i === 0} />
      ))}
    </div>
  );
}
