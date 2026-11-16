/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';
import { useCopy } from '@/lib/i18n/copy';
import { YearsText } from '@/components/years-text';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { ResumeCvButton } from '@/skins/phone/blocks/resume-cv-button';
import { ResumeEducation } from '@/skins/phone/blocks/resume-education';
import { ResumeRoles } from '@/skins/phone/blocks/resume-roles';
import { ResumeSkills } from '@/skins/phone/blocks/resume-skills';
import { PhPage } from '@/skins/phone/ui/ph-page';

/**
 * Resume as a Files app: the roles as a list with the role beside it (a tablet) or on a screen of its own (a phone), then the skills and the
 * education. While a role is open on a phone it is the only thing on the screen.
 */
export function ResumePage() {
  const copy = useCopy(resumeCopy);
  const [role, setRole] = useState<string | null>(null);
  const jobs = useContentQuery('experience');
  const { isPending: skillsPending } = useSkills();
  // the link "See all skills" of About ends in #skills, below the roles; the address of a role is the roles' own (`ResumeRoles` brings the
  // role under the bars, where the scroll to its row would leave the top of the role above them)
  const [roleAddress] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.location.hash.startsWith('#role-'),
  );
  useScrollToHash(!jobs.isPending && !skillsPending && !roleAddress);
  const open = role !== null;

  return (
    <PhPage
      page='resume'
      title={copy.title}
      lead={
        <YearsText
          withYears={copy.intro}
          withoutYears={copy.introUndated}
          spelled
        />
      }
      wide
    >
      <div
        className={cn('-mt-1 mb-8 empty:hidden', open && '@max-[899px]:hidden')}
      >
        <ResumeCvButton />
      </div>
      <ResumeRoles selected={role} onSelect={setRole} />
      <div className={cn('mt-8', open && '@max-[899px]:hidden')}>
        <ResumeSkills />
        <ResumeEducation />
      </div>
    </PhPage>
  );
}
