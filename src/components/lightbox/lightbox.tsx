/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { cn } from 'cn';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import type { KeyboardEvent, ReactNode } from 'react';
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';

export interface LightboxNav {
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
  /** e.g. '2 of 5', shown between the two buttons */
  counter?: string;
}

export interface LightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  image: { src: string; alt: string; width?: number; height?: number };
  /** the line(s) under the image, on the left of the footer */
  meta?: ReactNode;
  /** buttons and links in the footer, before the prev/next pair */
  actions?: ReactNode;
  /** leave out for a single item */
  nav?: LightboxNav;
  /** accessible name of the close button, in the visitor's language */
  closeLabel: string;
  /** extra classes for the image, e.g. padding for a QR code */
  imageClassName?: string;
}

const iconButton =
  'inline-flex size-10 items-center justify-center rounded-[10px] border bg-white text-foreground transition-colors outline-none hover:bg-muted active:bg-muted pointer-coarse:size-11';

/**
 * An image preview in a dialog: title bar, the image on a grey stage, then meta, actions and optional prev/next.
 * Arrow keys step through items. On phones it docks to the bottom edge as a sheet.
 */
export function Lightbox({
  open,
  onOpenChange,
  title,
  image,
  meta,
  actions,
  nav,
  closeLabel,
  imageClassName,
}: LightboxProps) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (!nav) return;
    if (e.key === 'ArrowLeft') nav.onPrev();
    if (e.key === 'ArrowRight') nav.onNext();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className='bg-night/60 supports-backdrop-filter:backdrop-blur-none' />
        <DialogPrimitive.Popup
          data-slot='lightbox'
          onKeyDown={onKeyDown}
          className={cn(
            'fixed z-50 flex flex-col overflow-hidden bg-white text-foreground shadow-[0_24px_64px_rgba(27,31,39,.35)] outline-none',
            'top-1/2 left-1/2 max-h-[92vh] w-[min(980px,94vw)] -translate-x-1/2 -translate-y-1/2 rounded-3xl',
            'max-[720px]:top-auto max-[720px]:bottom-0 max-[720px]:left-0 max-[720px]:max-h-[calc(100dvh-12px)] max-[720px]:w-full max-[720px]:translate-x-0 max-[720px]:translate-y-0 max-[720px]:rounded-b-none',
            'duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-97 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-97',
            'max-[720px]:data-open:slide-in-from-bottom-10 max-[720px]:data-closed:slide-out-to-bottom-10 max-[720px]:data-open:zoom-in-100 max-[720px]:data-closed:zoom-out-100',
          )}
        >
          <div className='flex items-center justify-between gap-3 border-b py-3.5 pr-4 pl-5'>
            <DialogTitle className='font-heading text-lg leading-snug font-bold tracking-[-0.01em]'>
              {title}
            </DialogTitle>
            <DialogClose
              aria-label={closeLabel}
              className={cn(iconButton, 'shrink-0')}
            >
              <X className='size-5' aria-hidden='true' />
            </DialogClose>
          </div>

          <div className='flex min-h-0 flex-1 items-center justify-center overflow-auto bg-muted p-5'>
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.width ?? 1200}
              height={image.height ?? 900}
              unoptimized
              className={cn(
                'block h-auto max-h-[calc(92vh-190px)] w-auto max-w-full bg-white shadow-[0_8px_28px_rgba(27,31,39,.18)] max-[720px]:max-h-[calc(100dvh-300px)]',
                imageClassName,
              )}
            />
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3 px-5 py-3 max-[720px]:flex-col max-[720px]:items-stretch'>
            <div className='min-w-0 text-[15px] text-muted-foreground'>
              {meta}
            </div>
            <div className='flex flex-wrap items-center justify-end gap-2 max-[720px]:[&>a]:flex-1 max-[720px]:[&>button]:flex-1 max-[720px]:justify-stretch'>
              {actions}
              {nav && (
                <div className='ml-1 flex items-center gap-2 max-[720px]:mt-1 max-[720px]:ml-0 max-[720px]:basis-full max-[720px]:justify-center'>
                  <button
                    type='button'
                    onClick={nav.onPrev}
                    aria-label={nav.prevLabel}
                    className={iconButton}
                  >
                    <ChevronLeft className='size-5' aria-hidden='true' />
                  </button>
                  {nav.counter && (
                    <span
                      aria-live='polite'
                      className='min-w-12 text-center text-sm text-muted-foreground tabular-nums'
                    >
                      {nav.counter}
                    </span>
                  )}
                  <button
                    type='button'
                    onClick={nav.onNext}
                    aria-label={nav.nextLabel}
                    className={iconButton}
                  >
                    <ChevronRight className='size-5' aria-hidden='true' />
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
