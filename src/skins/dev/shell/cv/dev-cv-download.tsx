/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { downloadCvPdf } from '@/components/cv/download-cv-pdf';
import { cvCopy } from '@/content/copy/cv';
import type { CvModel } from '@/lib/cv/build-cv';
import { useCopy } from '@/lib/i18n/copy';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { DevButton } from '@/skins/dev/ui/dev-button';

/**
 * Creates the PDF on click. The label never changes (so the bar does not shift): the icon turns and a polite status announces
 * the wait. A failure is reported through `onFailed`.
 */
export function DevCvDownload({
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
      <DevButton
        variant='solid'
        size='sm'
        className='ml-[2px] disabled:cursor-default disabled:opacity-60 data-[busy]:[&_svg]:animate-[dv-spin_0.8s_linear_infinite]'
        disabled={!cv}
        aria-busy={busy}
        data-busy={busy || undefined}
        onClick={download}
      >
        <DevIcon name={busy ? 'refresh' : 'cloud-download'} />
        {copy.download}
      </DevButton>
      <span role='status' className='sr-only'>
        {busy ? copy.preparing : ''}
      </span>
    </>
  );
}
