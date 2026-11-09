/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { homeCopy } from '@/content/copy/home';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useAcOverlays } from '@/skins/academic/shell/overlay-context';
import { AcButton } from '@/skins/academic/ui/ac-button';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/** The CV button of the title: it opens the CV sheet and is gone when the `cvDownload` switch is off. */
export function HomeCvButton() {
  const copy = useCopy(homeCopy);
  const live = useLive();
  const { openCv } = useAcOverlays();
  if (!live.features.cvDownload) return null;
  return (
    <AcButton aria-haspopup='dialog' onClick={openCv}>
      {copy.downloadCv}
      <AcIcon name='download' />
    </AcButton>
  );
}
