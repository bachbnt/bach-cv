/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download } from 'lucide-react';
import { resumeCopy } from '@/content/copy/resume';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';
import { PhButton } from '@/skins/phone/ui/ph-button';

/** The CV button under the title: it opens the CV sheet, and is not there when the `cvDownload` switch is off, as in Standard. */
export function ResumeCvButton() {
  const copy = useCopy(resumeCopy);
  const live = useLive();
  const { openCv } = usePhOverlays();
  if (!live.features.cvDownload) return null;
  return (
    <PhButton variant='solid' aria-haspopup='dialog' onClick={openCv}>
      <Download aria-hidden='true' className='size-[18px]' />
      {copy.downloadCv}
    </PhButton>
  );
}
