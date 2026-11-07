/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ResumeEducation } from '@/skins/moba/blocks/resume-education';
import { ResumeExperience } from '@/skins/moba/blocks/resume-experience';
import { ResumeHead } from '@/skins/moba/blocks/resume-head';
import { ResumeSkills } from '@/skins/moba/blocks/resume-skills';
import { MbPageGate } from '@/skins/moba/ui/mb-page-gate';

/** Resume, at the mid lane: the scoreboard. The roles are the towers of the lane (the current one the nexus), then the skills and the degrees. */
export function ResumePage() {
  return (
    <MbPageGate page='resume'>
      <ResumeHead />
      <ResumeExperience />
      <ResumeSkills />
      <ResumeEducation />
    </MbPageGate>
  );
}
