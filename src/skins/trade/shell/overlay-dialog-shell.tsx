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
import {
  TV_DIALOG_MOTION,
  TV_DIALOG_OVERLAY,
} from '@/skins/trade/shell/overlay-dialog-motion';

const SIZES = {
  sm: 'w-[min(460px,calc(100vw-24px))]',
  md: 'w-[min(720px,calc(100vw-24px))]',
  lg: 'w-[min(1000px,calc(100vw-24px))]',
} as const;

/**
 * The window of the Trade skin, in the manner of a chart terminal's dialogs: a dark panel with a 1px border, a title bar (the title on
 * the left, a close button on the right), an optional column of tabs on the left, a body, and an optional footer toolbar. It is the
 * shadcn dialog, so the focus is trapped, Esc closes it and the focus goes back to what opened it. It opens with a quick scale and
 * fade (none for reduced motion). On a phone it is a full-height sheet from the bottom edge (`phone='sheet'`) or the whole screen.
 */
export function TvDialogShell({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  size = 'md',
  phone = 'sheet',
  titleExtra,
  tabs,
  footer,
  className,
  bodyClassName,
  onKeyDown,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** read by assistive technology, not shown */
  description: string;
  /** accessible name of the close button, in the visitor's language */
  closeLabel: string;
  size?: keyof typeof SIZES;
  phone?: 'sheet' | 'full';
  /** next to the title, on the left of the close button (a counter, a status) */
  titleExtra?: ReactNode;
  /** a column on the left of the body */
  tabs?: ReactNode;
  /** a toolbar under the body */
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  onKeyDown?: (event: KeyboardEvent) => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className={TV_DIALOG_OVERLAY} />
        <DialogPrimitive.Popup
          data-slot='tv-dialog'
          onKeyDown={onKeyDown}
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[92dvh] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-md border border-tv-line bg-tv-panel text-[13px] text-tv-ink shadow-tv-dialog outline-none',
            TV_DIALOG_MOTION,
            SIZES[size],
            phone === 'sheet'
              ? 'max-[700px]:top-auto max-[700px]:bottom-0 max-[700px]:left-0 max-[700px]:max-h-[calc(100dvh-12px)] max-[700px]:w-full max-[700px]:translate-x-0 max-[700px]:translate-y-0 max-[700px]:rounded-b-none'
              : 'max-[700px]:inset-0 max-[700px]:top-0 max-[700px]:left-0 max-[700px]:h-dvh max-[700px]:max-h-none max-[700px]:w-full max-[700px]:translate-x-0 max-[700px]:translate-y-0 max-[700px]:rounded-none max-[700px]:border-0',
            className,
          )}
        >
          <div className='flex h-11 flex-none items-center gap-2 border-b border-tv-line pr-1.5 pl-4 pointer-coarse:h-12'>
            <DialogTitle className='min-w-0 flex-1 truncate text-[15px] leading-none font-bold'>
              {title}
            </DialogTitle>
            {titleExtra}
            <DialogClose
              aria-label={closeLabel}
              className='grid size-8 flex-none cursor-pointer place-items-center rounded text-tv-mute transition-[background-color,color,scale] duration-100 hover:bg-tv-hover hover:text-tv-ink active:scale-90 active:bg-tv-hover pointer-coarse:size-11'
            >
              <X aria-hidden='true' className='size-[18px]' />
            </DialogClose>
          </div>
          <DialogDescription className='sr-only'>
            {description}
          </DialogDescription>
          <div className='flex min-h-0 flex-1'>
            {tabs && (
              <div className='w-44 flex-none overflow-y-auto border-r border-tv-line max-[700px]:hidden'>
                {tabs}
              </div>
            )}
            <div
              className={cn(
                'flex min-h-0 min-w-0 flex-1 flex-col',
                bodyClassName,
              )}
            >
              {children}
            </div>
          </div>
          {footer && (
            <div className='flex flex-none items-center gap-2 border-t border-tv-line px-3 py-2'>
              {footer}
            </div>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
