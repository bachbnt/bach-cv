/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import Image from 'next/image';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { copyToClipboard } from '@/components/payment/copy-to-clipboard';
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { academicOverlaysCopy } from '@/content/copy/academic-overlays';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import {
  useAcOverlays,
  type ViewerItem,
} from '@/skins/academic/shell/overlay-context';
import { AcButton, AcButtonLink } from '@/skins/academic/ui/ac-button';
import { AC_FONT_VARS } from '@/skins/academic/ui/ac-fonts';
import '@/skins/academic/css/overlays.css';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/** The round pen buttons that step to the next or the previous picture. */
const STEP =
  'grid size-11 cursor-pointer place-items-center rounded-[18px_9px_20px_10px/10px_20px_9px_18px] border-[2.2px] border-ac-mute bg-transparent text-ac-ink transition-colors hover:border-ac-link hover:bg-ac-link/10 hover:text-ac-link';

/**
 * The viewer of project screenshots, certificates and payment QR codes: a photo taped on a sheet of paper, a strip of small photos under it,
 * the links and the copy button of the picture in its foot. It shows what `useAcOverlays().viewer` holds; Esc, the close button or a
 * click outside close it and focus goes back to what opened it.
 */
export function AcViewer() {
  const { viewer, closeViewer } = useAcOverlays();
  return (
    <Dialog
      open={viewer !== null}
      onOpenChange={(open) => {
        if (!open) closeViewer();
      }}
    >
      {viewer && viewer.items.length > 0 && (
        <DialogPortal>
          <DialogOverlay className='bg-black/65 supports-backdrop-filter:backdrop-blur-none' />
          <AcViewerSheet items={viewer.items} index={viewer.index} />
        </DialogPortal>
      )}
    </Dialog>
  );
}

function AcViewerSheet({
  items,
  index,
}: {
  items: ViewerItem[];
  index: number;
}) {
  const { setViewerIndex, closeViewer, say } = useAcOverlays();
  const copy = useCopy(academicOverlaysCopy).viewer;
  const thumbs = useRef<HTMLDivElement>(null);
  const item = items[index] ?? items[0];
  const total = items.length;
  const single = total < 2;
  const step = (by: number) => setViewerIndex((index + by + total) % total);

  // the picked thumbnail stays in view when the strip scrolls (arrow keys, wrapping around)
  useEffect(() => {
    thumbs.current
      ?.querySelector<HTMLElement>('[aria-current=true]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [index]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (single || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft') step(-1);
    else if (event.key === 'ArrowRight') step(1);
  };

  const copyText = async (text: string, done: string) => {
    if (await copyToClipboard(text)) say(done);
  };

  return (
    <DialogPrimitive.Popup
      data-slot='ac-viewer'
      onKeyDown={onKeyDown}
      className={cn(
        'ac-scope font-ac-serif fixed top-1/2 left-1/2 z-50 w-[min(900px,calc(100vw-20px))] max-h-[calc(100dvh-20px)] -translate-x-1/2 -translate-y-1/2 outline-none',
        AC_FONT_VARS,
      )}
    >
      <div className='ac-paper ac-tape animate-[ac-lift_0.34s_cubic-bezier(0.2,0.8,0.25,1)] rounded-[2px]'>
        <div className='max-h-[calc(100dvh-20px)] overflow-y-auto px-[30px] pt-7 pb-5 max-[720px]:px-3 max-[720px]:pt-[22px] max-[720px]:pb-4'>
          <DialogPrimitive.Close
            aria-label={item.labels?.close ?? copy.close}
            className='absolute top-3 right-3.5 grid size-9 cursor-pointer place-items-center rounded-full border-2 border-transparent text-ac-mute transition-colors hover:border-ac-mute pointer-coarse:size-11'
            onClick={closeViewer}
          >
            <AcIcon name='close' className='size-5' />
          </DialogPrimitive.Close>
          <DialogTitle className='ac-line mx-auto mb-3.5 block w-fit max-w-full text-center font-ac-chalk text-[34px]/[1.05] font-normal [--ul:var(--ac-accent)] [--ac-line-y:-5px] max-[720px]:text-[28px]'>
            {item.title}
          </DialogTitle>
          <DialogDescription className='sr-only'>
            {copy.description}
          </DialogDescription>

          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-[color-mix(in_srgb,#8a7f63_20%,transparent)] px-2 py-[22px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.09),inset_0_3px_10px_rgba(0,0,0,0.14)] [grid-template-areas:'prev_photo_next'] max-[720px]:grid-cols-2 max-[720px]:gap-y-3 max-[720px]:py-[18px] max-[720px]:[grid-template-areas:'photo_photo'_'prev_next']">
            {single ? (
              <span className='[grid-area:prev] max-[720px]:hidden' />
            ) : (
              <button
                type='button'
                aria-label={item.labels?.previous ?? copy.previous}
                onClick={() => step(-1)}
                className={cn(
                  STEP,
                  '[grid-area:prev] max-[720px]:justify-self-end',
                )}
              >
                <AcIcon name='chevronLeft' className='size-6' />
              </button>
            )}
            <figure
              className={cn(
                'relative m-0 mx-3.5 mt-1 mb-1 max-w-full -rotate-[0.6deg] justify-self-center bg-[#fffefa] p-[9px] pb-9 shadow-[0_8px_18px_rgba(0,0,0,0.34)] [grid-area:photo] max-[720px]:mx-2',
                single && 'pb-[9px]',
              )}
            >
              <span
                aria-hidden='true'
                className='absolute -top-2.5 -left-3.5 h-5 w-[58px] -rotate-[36deg] bg-ac-tape shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              />
              <span
                aria-hidden='true'
                className='absolute -top-2.5 -right-3.5 h-5 w-[58px] rotate-[32deg] bg-ac-tape shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              />
              <Image
                key={item.src}
                src={item.src}
                alt={item.caption}
                width={900}
                height={1600}
                unoptimized
                className='mx-auto block h-auto max-h-[min(50vh,440px)] w-auto max-w-full min-w-[120px] bg-white'
              />
              {!single && (
                <figcaption
                  aria-live='polite'
                  className='absolute inset-x-2 bottom-1.5 truncate text-center font-ac-note text-[18px]/[1.1] text-ac-ink'
                >
                  {fill(copy.counter, { current: index + 1, total })}
                </figcaption>
              )}
            </figure>
            {single ? (
              <span className='[grid-area:next] max-[720px]:hidden' />
            ) : (
              <button
                type='button'
                aria-label={item.labels?.next ?? copy.next}
                onClick={() => step(1)}
                className={cn(
                  STEP,
                  '[grid-area:next] max-[720px]:justify-self-start',
                )}
              >
                <AcIcon name='chevronRight' className='size-6' />
              </button>
            )}
          </div>

          {!single && (
            <div
              ref={thumbs}
              role='group'
              aria-label={copy.pictures}
              className='flex justify-center gap-2.5 overflow-x-auto px-1.5 pt-3.5 pb-1.5 max-[720px]:justify-start'
            >
              {items.map((thumb, i) => (
                <button
                  key={`${thumb.src}-${i}`}
                  type='button'
                  aria-label={fill(copy.goTo, { current: i + 1, total })}
                  aria-current={i === index}
                  onClick={() => setViewerIndex(i)}
                  className='relative size-[58px] shrink-0 cursor-pointer bg-[#fffefa] p-[3px] opacity-80 shadow-[0_2px_5px_rgba(0,0,0,0.32)] transition-opacity nth-[3n+1]:-rotate-[1.4deg] nth-[3n]:rotate-[1.6deg] aria-current:opacity-100 aria-current:outline-[2.5px] aria-current:outline-offset-1 aria-current:outline-ac-link aria-current:shadow-[0_0_0_5px_rgba(255,207,51,0.7),0_2px_5px_rgba(0,0,0,0.32)] pointer-coarse:size-12 hover:opacity-100'
                >
                  <span className='relative block size-full overflow-hidden'>
                    <Image
                      src={thumb.src}
                      alt=''
                      fill
                      sizes='58px'
                      unoptimized
                      className='object-cover object-top'
                    />
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className='mt-3.5 flex flex-wrap items-center justify-between gap-x-[18px] gap-y-2.5 text-left max-[720px]:flex-col max-[720px]:items-stretch'>
            <p className='m-0 font-ac-note text-[18px]/[1.35] text-ac-mute'>
              {item.subtitle}
            </p>
            <div className='flex flex-wrap gap-2 max-[720px]:[&>*]:flex-1'>
              {item.copy && (
                <AcButton
                  variant='quiet'
                  size='sm'
                  onClick={() => {
                    const c = item.copy;
                    if (c) void copyText(c.text, c.done);
                  }}
                >
                  {item.copy.label}
                </AcButton>
              )}
              {item.save && (
                <AcButton
                  variant='quiet'
                  size='sm'
                  onClick={() => {
                    const s = item.save;
                    if (s) void s.run();
                  }}
                >
                  {item.save.label}
                </AcButton>
              )}
              {item.links?.map((link) => (
                <AcButtonLink
                  key={link.url}
                  variant='quiet'
                  size='sm'
                  href={link.url}
                >
                  {link.label}
                  <AcIcon name='external' />
                </AcButtonLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DialogPrimitive.Popup>
  );
}
