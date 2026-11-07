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

/**
 * The frame of the windows of the skin (the picture viewer, the keys, the CV): a gold-framed panel in the middle of the stage, a sheet on
 * a phone, a title bar with a close button, and Esc, the backdrop and focus handling from the shadcn dialog.
 */
export function MbDialog({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  className,
  bar,
  hideTitle,
  onKeyDown,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: string;
  closeLabel: string;
  className?: string;
  /** extra controls in the title bar, before the close button */
  bar?: ReactNode;
  hideTitle?: boolean;
  /** keys pressed anywhere in the window, including right after it opens (focus is on its close button) */
  onKeyDown?: (event: KeyboardEvent) => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className='bg-mb-void/75 supports-backdrop-filter:backdrop-blur-[2px]' />
        <DialogPrimitive.Popup
          data-slot='mb-dialog'
          onKeyDown={onKeyDown}
          className={cn(
            'mb-card mb-dialog fixed top-1/2 left-1/2 z-[90] flex max-h-[min(92dvh,900px)] w-[min(960px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden text-mb-ink outline-none',
            'transition duration-200 ease-out data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0',
            'max-[719px]:top-auto max-[719px]:bottom-0 max-[719px]:max-h-[calc(100dvh-8px)] max-[719px]:w-full max-[719px]:translate-y-0 max-[719px]:data-ending-style:translate-y-8 max-[719px]:data-starting-style:translate-y-8',
            className,
          )}
        >
          <div className='mb-panel-head flex flex-none items-center gap-3 py-2.5 pr-3 pl-5 max-[719px]:pl-3'>
            <DialogTitle
              className={cn(
                'min-w-0 flex-1 truncate font-mb-display text-[24px] leading-tight font-bold text-mb-title',
                hideTitle && 'sr-only',
              )}
            >
              {title}
            </DialogTitle>
            {bar}
            <DialogClose
              aria-label={closeLabel}
              className='mb-top-btn grid size-10 flex-none cursor-pointer place-items-center text-mb-gold-ink hover:text-mb-title pointer-coarse:size-11'
            >
              <X aria-hidden='true' className='size-5' />
            </DialogClose>
          </div>
          <DialogDescription className='sr-only'>
            {description}
          </DialogDescription>
          {children}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
