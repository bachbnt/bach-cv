/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { ChevronLeft, ChevronRight, XIcon } from 'lucide-react';
import Image from 'next/image';
import { useState, type KeyboardEvent } from 'react';
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import { fillCopy } from '@/components/projects/project-helpers';

const control =
  'inline-flex size-10 items-center justify-center rounded-[10px] border bg-white transition-colors hover:bg-secondary active:bg-secondary max-[720px]:size-11 pointer-coarse:size-11';

/**
 * The screenshots of a project in a dialog: previous/next (also with the arrow keys, wrapping around),
 * a counter, Escape or the backdrop to close. On a phone it is a bottom sheet with rounded top corners.
 */
export function ScreenshotsDialog({
  name,
  images,
  open,
  onOpenChange,
}: {
  name: string;
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const copy = useCopy(projectsCopy);
  const [index, setIndex] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  // every opening starts at the first screenshot
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setIndex(0);
  }

  const total = images.length;
  const go = (step: number) =>
    setIndex((current) => (current + step + total) % total);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') go(-1);
    if (event.key === 'ArrowRight') go(1);
  };
  const current = images[index];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className='bg-night/60 supports-backdrop-filter:backdrop-blur-none' />
        <DialogPrimitive.Popup
          data-slot='screenshots-dialog'
          onKeyDown={onKeyDown}
          className='fixed bottom-0 left-0 z-50 flex max-h-[calc(100dvh-12px)] w-full flex-col overflow-hidden rounded-t-[20px] bg-white text-foreground shadow-[0_24px_64px_rgba(27,31,39,.35)] outline-none duration-300 data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-10 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-10 min-[721px]:top-1/2 min-[721px]:bottom-auto min-[721px]:left-1/2 min-[721px]:max-h-[92vh] min-[721px]:w-[min(980px,94vw)] min-[721px]:-translate-x-1/2 min-[721px]:-translate-y-1/2 min-[721px]:rounded-[20px] min-[721px]:duration-200 min-[721px]:data-open:slide-in-from-bottom-0 min-[721px]:data-open:zoom-in-95 min-[721px]:data-closed:slide-out-to-bottom-0 min-[721px]:data-closed:zoom-out-95'
        >
          <div className='flex items-center justify-between gap-3 border-b py-3.5 pr-4 pl-5'>
            <DialogTitle className='text-lg leading-normal font-bold tracking-[-0.01em]'>
              {name}
            </DialogTitle>
            <DialogClose aria-label={copy.dialog.close} className={control}>
              <XIcon className='size-5' aria-hidden='true' />
            </DialogClose>
          </div>
          <div className='flex min-h-0 flex-1 items-center justify-center overflow-auto bg-secondary p-5'>
            {current && (
              <Image
                key={current}
                src={current}
                alt={fillCopy(copy.dialog.alt, { name, current: index + 1 })}
                width={900}
                height={1600}
                className='block h-auto max-h-[calc(92dvh-190px)] w-auto max-w-full bg-white shadow-[0_8px_28px_rgba(27,31,39,.18)]'
              />
            )}
          </div>
          <div className='flex flex-col items-stretch gap-3 px-5 py-3 min-[721px]:flex-row min-[721px]:flex-wrap min-[721px]:items-center min-[721px]:justify-between'>
            <p aria-live='polite' className='text-[15px] text-muted-foreground'>
              {fillCopy(copy.dialog.counter, { current: index + 1, total })}
            </p>
            {total > 1 && (
              <div className='flex justify-center gap-2 min-[721px]:justify-end'>
                <button
                  type='button'
                  aria-label={copy.dialog.previous}
                  onClick={() => go(-1)}
                  className={control}
                >
                  <ChevronLeft className='size-5' aria-hidden='true' />
                </button>
                <button
                  type='button'
                  aria-label={copy.dialog.next}
                  onClick={() => go(1)}
                  className={control}
                >
                  <ChevronRight className='size-5' aria-hidden='true' />
                </button>
              </div>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
