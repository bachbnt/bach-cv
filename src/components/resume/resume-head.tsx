/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { DownloadCv } from '@/components/download-cv';
import { PageHead } from '@/components/page-head';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { YearsText } from '@/components/years-text';

/** The tinted head of Resume: title, intro and the CV button. */
export function ResumeHead() {
  const copy = useCopy(resumeCopy);
  return (
    <PageHead
      title={copy.title}
      intro={
        <YearsText
          withYears={copy.intro}
          withoutYears={copy.introUndated}
          spelled
        />
      }
    >
      <div className='mt-6'>
        <DownloadCv label={copy.downloadCv} />
      </div>
    </PageHead>
  );
}
