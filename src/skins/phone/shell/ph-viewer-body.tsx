/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Copy, Download, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { DialogDescription } from '@/components/ui/dialog';
import { phoneOverlaysCopy } from '@/content/copy/phone-overlays';
import { fill } from '@/lib/chat/fill';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import { useCopy } from '@/lib/i18n/copy';
import {
  usePhOverlays,
  type ViewerItem,
} from '@/skins/phone/shell/overlay-context';
import { PhOverlayBar } from '@/skins/phone/shell/ph-overlay-bar';
import { PhViewerStep } from '@/skins/phone/shell/ph-viewer-step';
import { PhViewerThumbs } from '@/skins/phone/shell/ph-viewer-thumbs';
import { swipeStep } from '@/skins/phone/shell/swipe-step';
import { PhButton, phButtonVariants } from '@/skins/phone/ui/ph-button';

/**
 * What the viewer shows for the picture on view: the bar (name, line, the copy and save tools), the picture on a reserved stage with the
 * step buttons and the counter, the thumbnails and the links. The arrow keys and a swipe step through the pictures and wrap around: on a
 * touch screen the picture follows the finger sideways and the next one slides in from the side the step went to; a drag down on the
 * picture is left to the frame, which closes the viewer.
 */
export function PhViewerBody({
  items,
  index,
}: {
  items: ViewerItem[];
  index: number;
}) {
  const { setViewerIndex, say } = usePhOverlays();
  const copy = useCopy(phoneOverlaysCopy).viewer;
  const start = useRef<{ x: number; y: number; axis: 'x' | 'y' | null } | null>(
    null,
  );
  const mover = useRef<HTMLDivElement>(null);
  // the way the last step went (1 forward, -1 back): the side the next picture comes in from
  const [from, setFrom] = useState(0);
  const item = items[index] ?? items[0];
  const total = items.length;
  const single = total < 2;
  const links = item.links ?? [];
  const go = (to: number, by: number) => {
    setFrom(Math.sign(by));
    setViewerIndex(to);
  };
  const step = (by: number) => go((index + by + total) % total, by);
  const settle = () => {
    const el = mover.current;
    if (!el) return;
    el.style.transition = 'transform 280ms var(--ease-ph-out)';
    el.style.transform = '';
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (single || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft') step(-1);
    else if (event.key === 'ArrowRight') step(1);
  };
  const onPointerDown = (event: PointerEvent) => {
    start.current =
      event.pointerType === 'touch'
        ? { x: event.clientX, y: event.clientY, axis: null }
        : null;
  };
  const onPointerMove = (event: PointerEvent) => {
    const from = start.current;
    if (!from) return;
    const dx = event.clientX - from.x;
    const dy = event.clientY - from.y;
    if (from.axis === null && Math.hypot(dx, dy) > 6)
      from.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    const el = mover.current;
    if (from.axis !== 'x' || single || !el) return;
    el.style.transition = 'none';
    el.style.transform = `translateX(${dx}px)`;
  };
  const onPointerUp = (event: PointerEvent) => {
    const from = start.current;
    start.current = null;
    if (!from || from.axis === 'y') return;
    const by = swipeStep(event.clientX - from.x, event.clientY - from.y);
    if (by !== 0 && !single) step(by);
    else settle();
  };
  const onPointerCancel = () => {
    const from = start.current;
    start.current = null;
    if (from?.axis === 'x') settle();
  };

  const copyText = async (text: string, done: string) => {
    if (await copyToClipboard(text)) say(done);
  };

  const tools = (item.copy || item.save) && (
    <>
      {item.copy && (
        <PhButton
          onClick={() => {
            const c = item.copy;
            if (c) void copyText(c.text, c.done);
          }}
        >
          <Copy aria-hidden='true' className='size-4' />
          {item.copy.label}
        </PhButton>
      )}
      {item.save && (
        <PhButton
          onClick={() => {
            const s = item.save;
            if (s) void s.run();
          }}
        >
          <Download aria-hidden='true' className='size-4' />
          {item.save.label}
        </PhButton>
      )}
    </>
  );

  return (
    <div
      onKeyDown={onKeyDown}
      // the stage is the whole screen when it is narrow: in a device, start below the camera
      className='flex min-h-0 flex-1 flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] group-data-[mode=device]/ph:@max-[899px]:pt-10'
    >
      <PhOverlayBar
        title={item.title}
        subtitle={item.subtitle}
        actions={tools || undefined}
        closeLabel={item.labels?.close ?? copy.close}
      />
      <DialogDescription className='sr-only'>
        {copy.description}
      </DialogDescription>

      <div className="grid min-h-0 flex-1 grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 px-3 [grid-template-areas:'photo_photo_photo'_'prev_count_next'] @min-[900px]:px-4 @min-[900px]:[grid-template-areas:'prev_photo_next'_'._count_.']">
        <div
          data-ph-drag='touch'
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          className='relative grid size-full min-h-0 min-w-0 touch-none grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] place-items-center overflow-hidden rounded-ph-panel bg-ph-sheet-2 p-3 [grid-area:photo]'
        >
          <div
            key={item.src}
            ref={mover}
            data-from={from}
            className='ph-overlay-slide grid size-full min-h-0 min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] place-items-center'
          >
            <Image
              src={item.src}
              alt={item.caption}
              width={1200}
              height={900}
              unoptimized
              draggable={false}
              className='h-auto max-h-full w-auto max-w-full rounded-ph-inner bg-ph-paper object-contain select-none'
            />
          </div>
        </div>
        {!single && (
          <>
            <PhViewerStep
              direction='previous'
              label={item.labels?.previous ?? copy.previous}
              onStep={() => step(-1)}
              className='[grid-area:prev]'
            />
            <p
              aria-live='polite'
              className='m-0 text-center text-[14px] text-ph-mute tabular-nums [grid-area:count]'
            >
              {fill(copy.counter, { current: index + 1, total })}
            </p>
            <PhViewerStep
              direction='next'
              label={item.labels?.next ?? copy.next}
              onStep={() => step(1)}
              className='[grid-area:next]'
            />
          </>
        )}
      </div>

      {!single && (
        <PhViewerThumbs
          items={items}
          index={index}
          onPick={(to) => go(to, Math.sign(to - index))}
        />
      )}

      {links.length > 0 ? (
        <div className='flex shrink-0 flex-wrap items-center gap-2 px-4 pt-3 pb-3 @min-[900px]:justify-center @max-[559px]:*:flex-1'>
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target='_blank'
              rel='noopener'
              className={phButtonVariants({ variant: 'solid' })}
            >
              {link.label}
              <ExternalLink aria-hidden='true' className='size-4' />
            </a>
          ))}
        </div>
      ) : (
        <div className='h-3 shrink-0' />
      )}
    </div>
  );
}
