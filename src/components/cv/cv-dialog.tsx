/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import dynamic from 'next/dynamic';
import { Dialog, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { cn } from 'cn';

/** The sheets and the data hooks load only when the dialog first opens. */
const CvDialogContent = dynamic(
  () =>
    import('@/components/cv/cv-dialog-content').then((m) => m.CvDialogContent),
  { ssr: false },
);

/**
 * The CV preview: a centred panel on desktop, a bottom sheet with rounded top corners on a phone.
 * Controlled, so any "Download CV" button can open it.
 */
export function CvDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className='bg-night/55 supports-backdrop-filter:backdrop-blur-none' />
        <DialogPrimitive.Popup
          data-slot='cv-dialog'
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex h-[min(92vh,900px)] w-[min(1000px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl bg-white text-foreground shadow-[0_24px_64px_rgba(27,31,39,0.35)] outline-none',
            'transition duration-300 ease-out data-ending-style:translate-y-[calc(-50%+18px)] data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:translate-y-[calc(-50%+18px)] data-starting-style:scale-[0.97] data-starting-style:opacity-0',
            'max-[720px]:inset-x-0 max-[720px]:top-auto max-[720px]:bottom-0 max-[720px]:left-0 max-[720px]:h-[calc(100dvh-12px)] max-[720px]:w-full max-[720px]:translate-x-0 max-[720px]:translate-y-0 max-[720px]:rounded-b-none max-[720px]:data-ending-style:translate-y-8 max-[720px]:data-starting-style:translate-y-8',
          )}
        >
          <CvDialogContent />
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
