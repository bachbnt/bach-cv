/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useAcOverlays } from '@/skins/academic/shell/overlay-context';
import { AcButton } from '@/skins/academic/ui/ac-button';

/** The CV button of the header: it opens the CV sheet, and is gone when the `cvDownload` switch is off. Same name as Standard's. */
export function AcCvButton() {
  const live = useLive();
  const copy = useCopy(commonCopy);
  const { openCv } = useAcOverlays();
  if (!live.features.cvDownload) return null;
  return (
    <AcButton variant='quiet' size='sm' aria-haspopup='dialog' onClick={openCv}>
      {copy.downloadCv} ⇩
    </AcButton>
  );
}
