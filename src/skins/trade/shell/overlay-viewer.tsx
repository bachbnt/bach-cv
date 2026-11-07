/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { LightboxProps } from '@/components/lightbox/lightbox';
import { tradeOverlayCopy } from '@/content/copy/trade-overlay';
import { useCopy } from '@/lib/i18n/copy';
import { TvDialogShell } from '@/skins/trade/shell/overlay-dialog-shell';
import { TvNavTools } from '@/skins/trade/shell/overlay-nav-tools';
import { TvToolbar } from '@/skins/trade/shell/overlay-toolbar';
import { PICTURE_ZOOMS, zoomFromKey } from '@/skins/trade/shell/overlay-tools';
import { TvZoomStage } from '@/skins/trade/shell/overlay-zoom-stage';
import { TvZoomTools } from '@/skins/trade/shell/overlay-zoom-tools';

/**
 * The picture viewer, in the style of a chart snapshot: the picture on a dark stage with a toolbar over it (zoom out, in and fit,
 * the actions the caller gives, previous and next with the counter) and a strip of thumbnails when there is more than one picture.
 * The arrow keys step through the pictures; `+`, `-` and `0` zoom. It takes the props of the Standard lightbox, so the blocks that
 * open pictures (screenshots, certificates, QR codes) are not changed.
 */
export function TvViewer({
  open,
  onOpenChange,
  title,
  image,
  meta,
  actions,
  nav,
  thumbnails,
  closeLabel,
  imageClassName,
}: LightboxProps) {
  const words = useCopy(tradeOverlayCopy).viewer;
  const [step, setStep] = useState(0);
  const [source, setSource] = useState(image.src);
  const strip = useRef<HTMLDivElement>(null);
  const many = thumbnails !== undefined && thumbnails.items.length > 1;
  const picked = thumbnails?.current;
  const zoom = PICTURE_ZOOMS[step];

  // another picture starts at the size that fits
  if (source !== image.src) {
    setSource(image.src);
    setStep(0);
  }

  // the picked thumbnail stays in view when the arrow keys walk the row
  useEffect(() => {
    strip.current
      ?.querySelector<HTMLElement>('[aria-current=true]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [picked]);

  const last = PICTURE_ZOOMS.length - 1;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') nav?.onPrev();
    else if (event.key === 'ArrowRight') nav?.onNext();
    else {
      const next = zoomFromKey(event.key, step, last, 0);
      if (next !== null) setStep(next);
    }
  };

  return (
    <TvDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={image.alt}
      closeLabel={closeLabel}
      size='lg'
      phone='full'
      onKeyDown={onKeyDown}
    >
      <TvToolbar
        label={words.tools}
        zoom={
          <TvZoomTools
            words={words}
            step={step}
            last={last}
            fit={0}
            percent={zoom * 100}
            onStep={setStep}
          />
        }
        actions={actions}
        end={nav && <TvNavTools {...nav} />}
      />
      <TvZoomStage
        image={image}
        zoom={zoom}
        imageClassName={imageClassName}
        fitClassName='max-[700px]:max-h-[calc(100dvh-300px)]'
      />

      {many && (
        <div
          ref={strip}
          role='group'
          aria-label={thumbnails.groupLabel}
          className='flex flex-none gap-1.5 overflow-x-auto border-t border-tv-line px-3 py-2'
        >
          {thumbnails.items.map((item, i) => (
            <button
              key={item.src}
              type='button'
              aria-label={item.label}
              aria-current={i === thumbnails.current}
              onClick={() => thumbnails.onSelect(i)}
              className='relative size-12 flex-none cursor-pointer overflow-hidden rounded border border-tv-line bg-white opacity-55 transition-[opacity,scale] duration-100 hover:opacity-100 active:scale-95 aria-[current=true]:border-tv-accent aria-[current=true]:opacity-100 pointer-coarse:size-14'
            >
              <Image
                src={item.src}
                alt=''
                fill
                sizes='56px'
                unoptimized
                className='object-cover object-top'
              />
            </button>
          ))}
        </div>
      )}

      {meta && (
        <div className='flex-none border-t border-tv-line px-4 py-2 text-xs text-tv-mute'>
          {meta}
        </div>
      )}
    </TvDialogShell>
  );
}
