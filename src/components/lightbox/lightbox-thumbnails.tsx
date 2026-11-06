/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

export interface LightboxThumbnailsProps {
  /** the pictures in order; `label` is the accessible name of the button that shows it */
  items: { src: string; label: string }[];
  current: number;
  onSelect: (index: number) => void;
  /** accessible name of the whole list */
  groupLabel: string;
}

/** A row of small pictures under the big one: the current one is marked, any of them can be picked. */
export function LightboxThumbnails({
  items,
  current,
  onSelect,
  groupLabel,
}: LightboxThumbnailsProps) {
  const row = useRef<HTMLDivElement>(null);

  // the picked picture stays in view when the row scrolls (arrow keys, wrapping around)
  useEffect(() => {
    row.current
      ?.querySelector<HTMLElement>('[aria-current=true]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [current]);

  return (
    <div
      ref={row}
      role='group'
      aria-label={groupLabel}
      className='flex gap-2 overflow-x-auto border-t px-5 py-3'
    >
      {items.map((item, i) => (
        <button
          key={item.src}
          type='button'
          aria-label={item.label}
          aria-current={i === current}
          onClick={() => onSelect(i)}
          className='relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 border-transparent bg-white opacity-60 transition-[opacity,border-color] hover:opacity-100 active:opacity-100 aria-[current=true]:border-foreground aria-[current=true]:opacity-100 pointer-coarse:size-16'
        >
          <Image
            src={item.src}
            alt=''
            fill
            sizes='64px'
            unoptimized
            className='object-cover object-top'
          />
        </button>
      ))}
    </div>
  );
}
