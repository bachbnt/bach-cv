/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import type { KeyboardEvent, ReactNode } from 'react';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'w-[min(460px,calc(100vw-24px))]',
  md: 'w-[min(720px,calc(100vw-24px))]',
  lg: 'w-[min(1000px,calc(100vw-24px))]',
} as const;

/**
 * The window of the Travel skin, shared by the picture viewer, the screenshots, the QR ticket and the CV: a frosted card over the dimmed
 * map, with a title bar (a small kicker in the voice of a trip over the title, a round close button) and a dashed perforation under it
 * like the tear line of a pass. It is the shadcn dialog, so the focus is trapped, Esc closes it, the title names it and the focus
 * goes back to what opened it. It rises and fades in (not for reduced motion). On a phone it is a sheet from the bottom edge, or the
 * whole screen (`phone='full'`).
 */
export function TlDialogShell({
  open,
  onOpenChange,
  title,
  kicker,
  description,
  closeLabel,
  size = 'md',
  phone = 'sheet',
  titleExtra,
  footer,
  className,
  bodyClassName,
  finalFocus,
  onKeyDown,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** the trip-flavoured line above the title (decoration) */
  kicker: string;
  /** read by assistive technology, not shown */
  description: string;
  /** accessible name of the close button, in the visitor's language */
  closeLabel: string;
  size?: keyof typeof SIZES;
  phone?: 'sheet' | 'full';
  /** next to the title, before the close button (a counter, a status) */
  titleExtra?: ReactNode;
  /** a strip under the body */
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** what gets the focus when the window closes (the control that opened it, when it is not the one that had the focus) */
  finalFocus?: () => HTMLElement | null;
  onKeyDown?: (event: KeyboardEvent) => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className='bg-tl-sky-1/55 duration-200 motion-reduce:animate-none' />
        <DialogPrimitive.Popup
          data-slot='tl-dialog'
          finalFocus={finalFocus}
          onKeyDown={onKeyDown}
          className={cn(
            'tl-pop fixed top-1/2 left-1/2 z-50 flex max-h-[92dvh] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-tl-line bg-tl-solid text-[14px]/[1.4] text-tl-ink shadow-tl-pop outline-none',
            'transition-[opacity,scale,translate] duration-200 ease-out data-ending-style:scale-[.97] data-ending-style:opacity-0 data-starting-style:scale-[.97] data-starting-style:opacity-0 motion-reduce:transition-none',
            SIZES[size],
            phone === 'sheet'
              ? 'max-[700px]:top-auto max-[700px]:bottom-0 max-[700px]:left-0 max-[700px]:max-h-[calc(100dvh-12px)] max-[700px]:w-full max-[700px]:translate-x-0 max-[700px]:translate-y-0 max-[700px]:rounded-b-none max-[700px]:rounded-t-[26px] max-[700px]:data-ending-style:translate-y-8 max-[700px]:data-starting-style:translate-y-8'
              : 'max-[700px]:inset-0 max-[700px]:top-0 max-[700px]:left-0 max-[700px]:h-dvh max-[700px]:max-h-none max-[700px]:w-full max-[700px]:translate-x-0 max-[700px]:translate-y-0 max-[700px]:rounded-none max-[700px]:border-0',
            className,
          )}
        >
          <div className='flex flex-none items-center gap-3 border-b border-dashed border-tl-line py-3 pr-3 pl-5 max-[700px]:pl-4'>
            <div className='min-w-0 flex-1'>
              <p
                aria-hidden='true'
                className='m-0 text-[11px] font-extrabold tracking-[1px] text-tl-coral uppercase'
              >
                {kicker}
              </p>
              <DialogTitle className='truncate text-[17px]/[1.25] font-extrabold tracking-normal'>
                {title}
              </DialogTitle>
            </div>
            {titleExtra}
            <DialogClose
              aria-label={closeLabel}
              className='grid size-10 flex-none cursor-pointer place-items-center rounded-full bg-tl-chip text-tl-chip-ink transition-[transform,background-color] hover:-translate-y-px active:scale-95 pointer-coarse:size-11'
            >
              <X aria-hidden='true' className='size-[18px]' />
            </DialogClose>
          </div>
          <DialogDescription className='sr-only'>
            {description}
          </DialogDescription>
          <div className={cn('flex min-h-0 flex-1 flex-col', bodyClassName)}>
            {children}
          </div>
          {footer && (
            <div className='flex flex-none items-center gap-2 border-t border-dashed border-tl-line px-4 py-2.5'>
              {footer}
            </div>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
