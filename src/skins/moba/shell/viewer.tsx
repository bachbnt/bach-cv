/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import Image from 'next/image';
import { useState, type KeyboardEvent } from 'react';
import { mobaCopy } from '@/content/copy/moba';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { MbDialog } from '@/skins/moba/shell/mb-dialog';
import { useOverlays } from '@/skins/moba/shell/overlay-context';

const MIN = 1;
const MAX = 4;

/**
 * The picture viewer: the pictures of a project, a certificate or a payment QR code on a dark stage in a gold frame, with zoom, a strip
 * of thumbnails, previous and next (also the arrow keys, wrapping around) and a counter. What goes under the picture (chips, an account
 * name, Open PDF, Copy number) comes with the item. Every opening starts where the item says.
 */
export function Viewer() {
  const copy = useCopy(mobaCopy);
  const { viewer, setViewerIndex, closeViewer } = useOverlays();
  const [zoom, setZoom] = useState(1);
  const items = viewer?.items ?? [];
  const index = viewer?.index ?? 0;
  const item = items[index];
  const total = items.length;
  const step = (by: number) => {
    setZoom(1);
    setViewerIndex((index + by + total) % total);
  };
  const labels = item?.labels ?? {
    close: copy.dialogs.close,
    previous: copy.viewer.previous,
    next: copy.viewer.next,
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' && total > 1) step(-1);
    else if (event.key === 'ArrowRight' && total > 1) step(1);
    else if (event.key === '+' || event.key === '=')
      setZoom((z) => Math.min(MAX, z + 0.5));
    else if (event.key === '-') setZoom((z) => Math.max(MIN, z - 0.5));
    else if (event.key === '0') setZoom(1);
  };

  return (
    <MbDialog
      open={viewer !== null && item !== undefined}
      onOpenChange={(open) => {
        if (!open) {
          closeViewer();
          setZoom(1);
        }
      }}
      title={
        item && (
          <>
            {item.title}
            {item.subtitle && (
              <span className='ml-3 font-sans text-[13px] font-semibold tracking-normal text-mb-mute'>
                {item.subtitle}
              </span>
            )}
          </>
        )
      }
      description={copy.viewer.description}
      closeLabel={labels.close}
      className='w-[min(1040px,calc(100vw-24px))]'
      onKeyDown={onKeyDown}
    >
      {item && (
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='mb-stage-picture relative flex min-h-[200px] flex-1 items-center justify-center overflow-auto bg-mb-void p-4'>
            <Image
              key={item.src}
              src={item.src}
              alt={item.alt}
              width={1200}
              height={900}
              unoptimized
              style={{
                width: `${zoom * 100}%`,
                maxWidth: zoom === 1 ? '100%' : 'none',
              }}
              className={cn(
                'block h-auto max-h-[calc(92dvh-300px)] w-auto object-contain shadow-[0_8px_28px_rgb(0_0_0/0.5)] transition-[width] duration-150 motion-reduce:transition-none max-[719px]:max-h-[calc(100dvh-340px)]',
                zoom !== 1 && 'max-h-none',
                item.matted
                  ? 'max-w-[min(100%,460px)] bg-white p-4'
                  : 'bg-white',
              )}
            />
            <div className='absolute top-3 right-3 flex gap-1'>
              <button
                type='button'
                aria-label={copy.viewer.zoomIn}
                disabled={zoom >= MAX}
                onClick={() => setZoom((z) => Math.min(MAX, z + 0.5))}
                className='mb-top-btn grid size-9 cursor-pointer place-items-center text-mb-gold-ink disabled:opacity-40 pointer-coarse:size-11'
              >
                <ZoomIn aria-hidden='true' className='size-4' />
              </button>
              <button
                type='button'
                aria-label={copy.viewer.zoomOut}
                disabled={zoom <= MIN}
                onClick={() => setZoom((z) => Math.max(MIN, z - 0.5))}
                className='mb-top-btn grid size-9 cursor-pointer place-items-center text-mb-gold-ink disabled:opacity-40 pointer-coarse:size-11'
              >
                <ZoomOut aria-hidden='true' className='size-4' />
              </button>
              <button
                type='button'
                aria-label={copy.viewer.fit}
                onClick={() => setZoom(1)}
                className='mb-top-btn grid size-9 cursor-pointer place-items-center text-mb-gold-ink pointer-coarse:size-11'
              >
                <Maximize aria-hidden='true' className='size-4' />
              </button>
            </div>
          </div>
          {total > 1 && (
            <div
              role='group'
              aria-label={copy.viewer.pictures}
              className='flex flex-none gap-2 overflow-x-auto border-t border-mb-line bg-mb-well px-4 py-2.5'
            >
              {items.map((it, i) => (
                <button
                  key={`${it.src}-${i}`}
                  type='button'
                  aria-label={
                    it.thumbnailLabel ??
                    fill(copy.viewer.goTo, { current: i + 1, total })
                  }
                  aria-current={i === index}
                  onClick={() => {
                    setZoom(1);
                    setViewerIndex(i);
                  }}
                  className={cn(
                    'relative h-14 w-14 flex-none cursor-pointer overflow-hidden border-2 bg-white opacity-70 transition-opacity aria-current:border-mb-gold aria-current:opacity-100 pointer-coarse:h-16 pointer-coarse:w-16',
                    i === index ? 'border-mb-gold' : 'border-mb-line',
                  )}
                >
                  <Image
                    src={it.src}
                    alt=''
                    fill
                    sizes='64px'
                    unoptimized
                    className='object-cover'
                  />
                </button>
              ))}
            </div>
          )}
          <div className='flex flex-none flex-wrap items-center justify-between gap-3 border-t border-mb-line px-5 py-3 max-[719px]:flex-col max-[719px]:items-stretch max-[719px]:px-3'>
            <div className='min-w-0 text-[14px] text-mb-mute [overflow-wrap:anywhere]'>
              {item.meta}
            </div>
            <div className='flex flex-wrap items-center justify-end gap-2 max-[719px]:justify-stretch'>
              {item.actions}
              {total > 1 && (
                <div className='ml-1 flex items-center gap-2 max-[719px]:ml-0 max-[719px]:basis-full max-[719px]:justify-center'>
                  <button
                    type='button'
                    aria-label={labels.previous}
                    onClick={() => step(-1)}
                    className='mb-top-btn grid size-10 cursor-pointer place-items-center text-mb-gold-ink pointer-coarse:size-11'
                  >
                    <ChevronLeft aria-hidden='true' className='size-5' />
                  </button>
                  <span
                    aria-live='polite'
                    className='min-w-14 text-center text-sm font-bold text-mb-ink tabular-nums'
                  >
                    {fill(copy.viewer.counter, { current: index + 1, total })}
                  </span>
                  <button
                    type='button'
                    aria-label={labels.next}
                    onClick={() => step(1)}
                    className='mb-top-btn grid size-10 cursor-pointer place-items-center text-mb-gold-ink pointer-coarse:size-11'
                  >
                    <ChevronRight aria-hidden='true' className='size-5' />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </MbDialog>
  );
}
