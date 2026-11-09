/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { DownloadCv } from '@/components/download-cv';
import { PageHead } from '@/components/page-head';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { useYearsText } from '@/lib/query/use-career-years';

/** The tinted head of Resume: title, intro and the CV button. */
export function ResumeHead() {
  const copy = useCopy(resumeCopy);
  const intro = useYearsText(copy.intro, copy.introUndated, { spelled: true });
  return (
    <PageHead title={copy.title} intro={intro}>
      <div className='mt-6'>
        <DownloadCv label={copy.downloadCv} />
      </div>
    </PageHead>
  );
}
