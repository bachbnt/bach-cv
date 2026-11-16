/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { usePhOverlays } from '@/skins/phone/shell/overlay-context';
import { PhOverlayFrame } from '@/skins/phone/shell/ph-overlay-frame';
import { PhViewerBody } from '@/skins/phone/shell/ph-viewer-body';

/**
 * The viewer of project screenshots, certificates and payment QR codes: the whole screen on a phone, a large card on a tablet. It shows
 * what `usePhOverlays().viewer` holds; Esc, the close button or a click outside close it and focus goes back to what opened it.
 */
export function PhViewer() {
  const { viewer, closeViewer } = usePhOverlays();
  return (
    <PhOverlayFrame
      open={viewer !== null}
      onOpenChange={(open) => {
        if (!open) closeViewer();
      }}
      kind='stage'
      data-slot='ph-viewer'
    >
      {viewer && viewer.items.length > 0 && (
        <PhViewerBody items={viewer.items} index={viewer.index} />
      )}
    </PhOverlayFrame>
  );
}
