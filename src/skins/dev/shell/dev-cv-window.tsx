/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { useState, type MouseEvent } from 'react';
import { Dialog, DialogPortal } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { mono } from '@/skins/dev/fonts';
import { DevCvContent } from '@/skins/dev/shell/cv/dev-cv-content';
import { useDevOverlays } from '@/skins/dev/shell/dev-overlay-context';
import { windowPopupClass } from '@/skins/dev/shell/window-chrome';

/**
 * The CV window: the CV as white sheets (they stay white in the dark theme) with a Download PDF button, in a preview window
 * like the picture viewer. Esc, the red light or a click outside close it and focus goes back to the button that opened it.
 */
export function DevCvWindow() {
  const { cvOpen, closeCv } = useDevOverlays();
  const [maximized, setMaximized] = useState(false);
  if (!cvOpen && maximized) setMaximized(false);

  const onBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) closeCv();
  };

  return (
    <Dialog
      open={cvOpen}
      onOpenChange={(open) => {
        if (!open) closeCv();
      }}
    >
      <DialogPortal>
        <DialogPrimitive.Popup
          data-slot='dev-cv-window'
          className={cn(windowPopupClass(maximized), mono.variable)}
          onClick={onBackdropClick}
        >
          <DevCvContent
            maximized={maximized}
            onClose={closeCv}
            onToggleMaximize={() => setMaximized((m) => !m)}
          />
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
