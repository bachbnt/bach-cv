/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLive } from '@/hooks/use-live';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';
import { PhCvContent } from '@/skins/phone/shell/ph-cv-content';
import { PhOverlayFrame } from '@/skins/phone/shell/ph-overlay-frame';

/**
 * The CV as a document viewer: its A4 sheets (they stay white in both themes, as paper does, with their shadow) on the desk of a sheet that
 * rises from the bottom, the page on view named at its foot, with the Download PDF button, the same CV and the same PDF as Standard. Esc, the close button or a click outside close it and focus goes back to
 * what opened it. Nothing is rendered when the `cvDownload` switch is off.
 */
export function PhCvSheet() {
  const live = useLive();
  const { cvOpen, closeCv } = usePhOverlays();
  if (!live.features.cvDownload) return null;
  return (
    <PhOverlayFrame
      open={cvOpen}
      onOpenChange={(open) => {
        if (!open) closeCv();
      }}
      kind='sheet'
      data-slot='ph-cv-sheet'
      className='h-[94%] @min-[900px]:h-[min(92%,900px)] @min-[900px]:max-w-[780px]'
    >
      <PhCvContent />
    </PhOverlayFrame>
  );
}
