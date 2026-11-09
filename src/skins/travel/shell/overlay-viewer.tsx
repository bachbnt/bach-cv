/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { LightboxProps } from '@/components/lightbox/lightbox';
import { travelOverlaysCopy } from '@/content/copy/travel-overlays';
import { useCopy } from '@/lib/i18n/copy';
import { TlNavTools } from '@/skins/travel/shell/overlay-nav-tools';
import { TlToolbar } from '@/skins/travel/shell/overlay-toolbar';
import { PICTURE_ZOOMS, zoomFromKey } from '@/skins/travel/shell/overlay-tools';
import { TlZoomStage } from '@/skins/travel/shell/overlay-zoom-stage';
import { TlZoomTools } from '@/skins/travel/shell/overlay-zoom-tools';
import { TlDialogShell } from '@/skins/travel/ui/tl-dialog-shell';

/**
 * The picture viewer, a photo on a postcard table: the picture as a taped print on the table with a toolbar over it (zoom out, in and fit,
 * the actions the caller gives, previous and next with the counter), a strip of thumbnails when there is more than one picture and the
 * caller's caption. The arrow keys step through the pictures; `+`, `-` and `0` zoom. It takes the props of the Standard lightbox, so the
 * blocks that open pictures (screenshots, certificates, QR codes) are not changed.
 */
export function TlViewer({
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
  const words = useCopy(travelOverlaysCopy).viewer;
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
    <TlDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      kicker={words.kicker}
      description={image.alt}
      closeLabel={closeLabel}
      size='lg'
      phone='full'
      onKeyDown={onKeyDown}
    >
      <TlToolbar
        label={words.tools}
        zoom={
          <TlZoomTools
            words={words}
            step={step}
            last={last}
            fit={0}
            percent={zoom * 100}
            onStep={setStep}
          />
        }
        actions={actions}
        end={nav && <TlNavTools {...nav} />}
      />
      <TlZoomStage
        image={image}
        zoom={zoom}
        imageClassName={imageClassName}
        fitClassName='max-[700px]:max-h-[calc(100dvh-340px)]'
      />

      {many && (
        <div
          ref={strip}
          role='group'
          aria-label={thumbnails.groupLabel}
          className='flex flex-none gap-2 overflow-x-auto border-t border-tl-line px-3 py-2.5'
        >
          {thumbnails.items.map((item, i) => (
            <button
              key={item.src}
              type='button'
              aria-label={item.label}
              aria-current={i === thumbnails.current}
              onClick={() => thumbnails.onSelect(i)}
              className='relative size-12 flex-none cursor-pointer overflow-hidden rounded-xl border-2 border-transparent bg-white opacity-60 transition-[opacity,transform,border-color] hover:opacity-100 active:scale-95 aria-[current=true]:border-tl-coral aria-[current=true]:opacity-100 pointer-coarse:size-14'
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
        <div className='flex-none border-t border-tl-line px-4 py-2.5 text-[13px] text-tl-muted'>
          {meta}
        </div>
      )}
    </TlDialogShell>
  );
}
