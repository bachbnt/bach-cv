/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { downloadCvPdf } from '@/components/cv/download-cv-pdf';
import { Button } from '@/components/ui/button';
import { cvCopy } from '@/content/copy/cv';
import { useCopy } from '@/lib/i18n/copy';
import type { CvModel } from '@/lib/cv/build-cv';

/**
 * Creates the PDF on click. The label never changes (so the bar does not shift): the icon turns into a
 * spinner and a polite status announces the wait. A failure is reported through `onFailed`.
 */
export function CvDownloadButton({
  cv,
  fileName,
  onFailed,
}: {
  cv: CvModel | null;
  fileName: string;
  onFailed: (failed: boolean) => void;
}) {
  const copy = useCopy(cvCopy);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (!cv || busy) return;
    setBusy(true);
    onFailed(false);
    try {
      await downloadCvPdf(cv, copy, fileName);
    } catch {
      onFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        type='button'
        variant='brand'
        disabled={!cv}
        aria-busy={busy}
        onClick={download}
      >
        {busy ? (
          <Loader2 aria-hidden='true' className='animate-spin' />
        ) : (
          <Download aria-hidden='true' />
        )}
        {copy.download}
      </Button>
      <span role='status' className='sr-only'>
        {busy ? copy.preparing : ''}
      </span>
    </>
  );
}
