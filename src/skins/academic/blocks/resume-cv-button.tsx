/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLive } from '@/hooks/use-live';
import { useAcOverlays } from '@/skins/academic/shell/overlay-context';
import { AcButton } from '@/skins/academic/ui/ac-button';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/** The CV button of the page head: it opens the CV sheet and is gone when the `cvDownload` switch is off, like Standard's. */
export function ResumeCvButton({ label }: { label: string }) {
  const live = useLive();
  const { openCv } = useAcOverlays();
  if (!live.features.cvDownload) return null;
  return (
    <AcButton aria-haspopup='dialog' onClick={openCv}>
      {label}
      <AcIcon name='download' />
    </AcButton>
  );
}
