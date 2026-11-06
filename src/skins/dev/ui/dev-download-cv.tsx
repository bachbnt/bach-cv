/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLive } from '@/hooks/use-live';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { useDevOverlays } from '@/skins/dev/shell/dev-overlay-context';
import { DevButton } from '@/skins/dev/ui/dev-button';

/**
 * Opens the CV window. It looks like a shell command but its accessible name is the Standard one (`label`), so tests and screen
 * readers find the same button in every skin. Gone when the `cvDownload` switch is off.
 */
export function DevDownloadCv({
  label,
  className,
  onOpen,
}: {
  /** the visible words of the Standard button (`Download CV`), in the visitor's language */
  label: string;
  className?: string;
  /** called just before the window opens (the phone drawer closes itself) */
  onOpen?: () => void;
}) {
  const live = useLive();
  const { openCv } = useDevOverlays();
  if (!live.features.cvDownload) return null;
  return (
    <DevButton
      variant='solid'
      aria-haspopup='dialog'
      aria-label={label}
      className={className}
      onClick={() => {
        onOpen?.();
        openCv();
      }}
    >
      <DevIcon name='cloud-download' />
      <span aria-hidden='true'>./download-cv.sh</span>
    </DevButton>
  );
}
