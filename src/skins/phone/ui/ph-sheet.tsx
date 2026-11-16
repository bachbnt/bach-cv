/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { PhOverlayFrame } from '@/skins/phone/shell/ph-overlay-frame';

/**
 * A short task as a sheet that rises from the bottom of the screen (the filters and the order of the projects on a phone): a grabber, a title,
 * then what scrolls. It is the same frame as the chat, the CV and Connect (`PhOverlayFrame`: focus trap, Esc, a tap outside, a drag down on the
 * grabber, the same arrival and departure), with the title as its own line.
 */
export function PhSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** a line for readers under the title; hidden from the eye */
  description?: string;
  children: ReactNode;
}) {
  return (
    <PhOverlayFrame open={open} onOpenChange={onOpenChange} kind='sheet'>
      <DialogTitle className='shrink-0 px-5 pt-1 pb-1 text-[19px]/[1.2] font-bold [font-family:inherit]'>
        {title}
      </DialogTitle>
      <DialogDescription className='sr-only'>
        {description ?? title}
      </DialogDescription>
      <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain'>
        {children}
      </div>
    </PhOverlayFrame>
  );
}
