/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';
import { useCopy } from '@/lib/i18n/copy';
import { useYearsText } from '@/lib/query/use-career-years';
import { useContentQuery } from '@/lib/query/use-content';
import { ResumeCvButton } from '@/skins/academic/blocks/resume-cv-button';
import { ResumeEducation } from '@/skins/academic/blocks/resume-education';
import { ResumeExperience } from '@/skins/academic/blocks/resume-experience';
import { ResumeSkills } from '@/skins/academic/blocks/resume-skills';
import { AcPage } from '@/skins/academic/ui/ac-page';
import { AcPageHead } from '@/skins/academic/ui/ac-page-head';

/** Resume in the Academic skin: the roles as the numbered results of a manuscript, the skills as its table, the degrees after them. */
export function ResumePage() {
  const copy = useCopy(resumeCopy);
  const intro = useYearsText(copy.intro, copy.introUndated, { spelled: true });
  const jobs = useContentQuery('experience');
  const { isPending: skillsPending } = useSkills();
  // the link "See all skills" of About ends in #skills, below the roles
  useScrollToHash(!jobs.isPending && !skillsPending);
  return (
    <AcPage page='resume'>
      <AcPageHead page='resume' title={copy.title} lead={intro}>
        <div className='mt-5'>
          <ResumeCvButton label={copy.downloadCv} />
        </div>
      </AcPageHead>
      <ResumeExperience />
      <ResumeSkills />
      <ResumeEducation />
    </AcPage>
  );
}
