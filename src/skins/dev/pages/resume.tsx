/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { resumeCopy } from '@/content/copy/resume';
import { devCopy } from '@/content/copy/dev';
import { useYearsText } from '@/lib/query/use-career-years';
import { useContentQuery } from '@/lib/query/use-content';
import { useCopy } from '@/lib/i18n/copy';
import { DevExperienceList } from '@/skins/dev/blocks/experience-list';
import { DevEducationList } from '@/skins/dev/blocks/education-list';
import { DevResumeSkills } from '@/skins/dev/blocks/resume-skills';
import { countHint } from '@/skins/dev/ui/count-hint';
import { DevDownloadCv } from '@/skins/dev/ui/dev-download-cv';
import { DevPage } from '@/skins/dev/ui/dev-page';
import { DevPageHead } from '@/skins/dev/ui/dev-page-head';
import { DevSection } from '@/skins/dev/ui/dev-section';

/** Resume in the Dev skin: the career as a Source Control graph, the skills and the degrees. */
export function ResumePage() {
  const copy = useCopy(resumeCopy);
  const intro = useYearsText(copy.intro, copy.introUndated, { spelled: true });
  const { hints } = useCopy(devCopy);
  const jobs = useContentQuery('experience').data;
  const degrees = useContentQuery('education').data;

  return (
    <DevPage page='resume'>
      <DevPageHead page='resume' title={copy.title} intro={intro}>
        <DevDownloadCv label={copy.downloadCv} />
      </DevPageHead>
      <DevSection
        id='experience'
        title={copy.experience.title}
        hint={jobs?.length ? countHint(hints, 'roles', jobs.length) : undefined}
      >
        <DevExperienceList />
      </DevSection>
      <DevResumeSkills />
      <DevSection
        title={copy.education.title}
        hint={
          degrees?.length
            ? countHint(hints, 'degrees', degrees.length)
            : undefined
        }
      >
        <DevEducationList />
      </DevSection>
    </DevPage>
  );
}
