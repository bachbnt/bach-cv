/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { phoneOverlaysCopy } from '@/content/copy/phone-overlays';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import type { ViewerItem } from '@/skins/phone/shell/overlay-context';

/** A row of small pictures under the big one: the one on show is ringed, any of them can be picked. */
export function PhViewerThumbs({
  items,
  index,
  onPick,
}: {
  items: ViewerItem[];
  index: number;
  onPick: (index: number) => void;
}) {
  const copy = useCopy(phoneOverlaysCopy).viewer;
  const row = useRef<HTMLDivElement>(null);

  // the picked picture stays in view when the row scrolls (arrow keys, wrapping around)
  useEffect(() => {
    row.current
      ?.querySelector<HTMLElement>('[aria-current=true]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [index]);

  return (
    <div
      ref={row}
      role='group'
      aria-label={copy.pictures}
      className='flex shrink-0 gap-2 overflow-x-auto px-4 pt-3 pb-1 @min-[900px]:justify-center'
    >
      {items.map((thumb, i) => (
        <button
          key={`${thumb.src}-${i}`}
          type='button'
          aria-label={fill(copy.goTo, { current: i + 1, total: items.length })}
          aria-current={i === index}
          onClick={() => onPick(i)}
          className={cn(
            'relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-ph-inner bg-ph-sheet-3 opacity-65 transition-[opacity,scale] duration-100 hover:opacity-100 active:scale-95',
            'aria-[current=true]:opacity-100 aria-[current=true]:ring-2 aria-[current=true]:ring-ph-accent aria-[current=true]:ring-offset-2 aria-[current=true]:ring-offset-ph-sheet',
          )}
        >
          <Image
            src={thumb.src}
            alt=''
            fill
            sizes='56px'
            unoptimized
            className='object-cover object-top'
          />
        </button>
      ))}
    </div>
  );
}
