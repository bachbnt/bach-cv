/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download } from 'lucide-react';
import { commonCopy } from '@/content/copy/common';
import { resumeCopy } from '@/content/copy/resume';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useOverlays } from '@/skins/moba/shell/overlay-context';
import { MbButton } from '@/skins/moba/ui/mb-button';
import { MbPageHead } from '@/skins/moba/ui/mb-page-head';

/** The head of Resume: the title, the intro and the Download CV button (it opens the CV window, and goes when the `site/live` switch is off). */
export function ResumeHead() {
  const copy = useCopy(resumeCopy);
  const common = useCopy(commonCopy);
  const live = useLive();
  const { openCv } = useOverlays();
  return (
    <MbPageHead
      title={copy.title}
      intro={copy.intro}
      aside={
        live.features.cvDownload && (
          <MbButton
            variant='gold'
            aria-haspopup='dialog'
            aria-label={common.downloadCv}
            onClick={openCv}
          >
            <Download aria-hidden='true' className='size-4' />
            {copy.downloadCv}
          </MbButton>
        )
      }
    />
  );
}
