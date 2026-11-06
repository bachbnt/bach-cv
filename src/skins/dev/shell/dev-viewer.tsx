/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog, DialogPortal } from '@/components/ui/dialog';
import { useDevOverlays } from '@/skins/dev/shell/dev-overlay-context';
import { DevViewerWindow } from '@/skins/dev/shell/viewer/dev-viewer-window';

/**
 * The picture viewer: a preview window with the three lights, a title bar with zoom and file tools, the picture on a stage
 * with a strip of thumbnails, its tags and actions, and a status line. It shows what `useDevOverlays().viewer` holds.
 * Red closes it, green makes it fill the screen and yellow hides the thumbnails, tags and actions, so that only the picture is left
 * (grey when there is nothing to hide).
 */
export function DevViewer() {
  const { viewer, closeViewer } = useDevOverlays();
  return (
    <Dialog
      open={viewer !== null}
      onOpenChange={(open) => {
        if (!open) closeViewer();
      }}
    >
      {viewer && viewer.items.length > 0 && (
        <DialogPortal>
          <DevViewerWindow items={viewer.items} index={viewer.index} />
        </DialogPortal>
      )}
    </Dialog>
  );
}
