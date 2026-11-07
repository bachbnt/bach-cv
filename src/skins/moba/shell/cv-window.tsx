/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { CvDialogContent } from '@/components/cv/cv-dialog-content';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { useOverlays } from '@/skins/moba/shell/overlay-context';

/**
 * The CV window: the Standard preview (white sheets that stay white, Download PDF, the states of the CV) in a gold frame in the middle of
 * the stage, a sheet on a phone. Esc, the close button or a click outside close it and focus goes back to the button that opened it.
 */
export function CvWindow() {
  const { cvOpen, closeCv } = useOverlays();
  return (
    <Dialog open={cvOpen} onOpenChange={(open) => !open && closeCv()}>
      <DialogPortal>
        <DialogOverlay className='bg-mb-void/75 supports-backdrop-filter:backdrop-blur-[2px]' />
        <DialogPrimitive.Popup
          data-slot='mb-cv-window'
          className='mb-card fixed top-1/2 left-1/2 z-[90] flex h-[min(92dvh,900px)] w-[min(1000px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden text-mb-ink outline-none transition duration-200 ease-out data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0 max-[719px]:top-auto max-[719px]:bottom-0 max-[719px]:h-[calc(100dvh-8px)] max-[719px]:w-full max-[719px]:translate-y-0 max-[719px]:data-ending-style:translate-y-8 max-[719px]:data-starting-style:translate-y-8'
        >
          <CvDialogContent />
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
