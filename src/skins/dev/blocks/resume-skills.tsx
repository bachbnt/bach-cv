/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { DevCoreStack } from '@/skins/dev/blocks/core-stack';
import { DevSkillGroups } from '@/skins/dev/blocks/skill-groups';
import { DevSection } from '@/skins/dev/ui/dev-section';
import { DevSubHeading } from '@/skins/dev/ui/dev-sub-heading';

/** The Skills section of Resume: the core stack, then every listed skill by area. */
export function DevResumeSkills() {
  const { skills } = useCopy(resumeCopy);
  return (
    <DevSection id='skills' title={skills.title} sub={skills.lead}>
      <DevSubHeading title={skills.core.title} lead={skills.core.lead} />
      <DevCoreStack />
      <DevSubHeading title={skills.all.title} lead={skills.all.lead} />
      <DevSkillGroups />
    </DevSection>
  );
}
