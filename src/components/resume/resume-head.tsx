/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { DownloadCv } from '@/components/download-cv';
import { PageHead } from '@/components/page-head';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';

/** The tinted head of Resume: title, intro and the CV button. */
export function ResumeHead() {
  const copy = useCopy(resumeCopy);
  return (
    <PageHead title={copy.title} intro={copy.intro}>
      <div className='mt-6'>
        <DownloadCv label={copy.downloadCv} />
      </div>
    </PageHead>
  );
}
