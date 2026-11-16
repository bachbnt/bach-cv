/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * The bar at the top of an overlay, the same in all of them: what it is on the left (its title, which names the window for readers, and a
 * line under it), its tools on the right and the close button, always last. On a narrow screen the tools drop to a row of their own
 * under the title, so neither the title nor a button is squeezed. The bar is a place to take hold of the window and drag it down to close it
 * (`useOverlayDrag`); its buttons keep their own presses.
 */
export function PhOverlayBar({
  title,
  subtitle,
  leading,
  actions,
  closeLabel,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** a picture before the title (the avatar of the assistant) */
  leading?: ReactNode;
  actions?: ReactNode;
  /** the accessible name of the close button, in the visitor's language */
  closeLabel: string;
  className?: string;
}) {
  return (
    <div
      data-slot='ph-overlay-bar'
      data-ph-drag=''
      className={cn(
        'flex shrink-0 touch-none flex-wrap select-none items-center gap-x-3 gap-y-2.5 px-4 pt-2 pb-3 @min-[900px]:px-5 @min-[900px]:pt-4',
        className,
      )}
    >
      {leading}
      <div className='min-w-0 flex-1 basis-32 self-center'>
        <DialogTitle className='text-[19px]/[1.25] font-bold wrap-break-word'>
          {title}
        </DialogTitle>
        {subtitle && (
          <div className='mt-0.5 text-[14px]/[1.4] wrap-break-word text-ph-mute'>
            {subtitle}
          </div>
        )}
      </div>
      <DialogPrimitive.Close
        aria-label={closeLabel}
        className='order-2 inline-grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-ph-sheet-3 text-ph-ink transition-[scale,background-color] duration-100 hover:bg-ph-line active:scale-[0.94]'
      >
        <X aria-hidden='true' className='size-5' strokeWidth={2.2} />
      </DialogPrimitive.Close>
      {actions && (
        <div className='order-3 flex w-full flex-wrap items-center gap-2 @min-[560px]:order-1 @min-[560px]:w-auto @min-[560px]:flex-nowrap @max-[559px]:*:flex-1'>
          {actions}
        </div>
      )}
    </div>
  );
}
