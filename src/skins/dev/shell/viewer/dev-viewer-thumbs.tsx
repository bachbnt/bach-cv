/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef } from 'react';
import { devOverlaysCopy } from '@/content/copy/dev-overlays';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import type { ViewerItem } from '@/skins/dev/shell/dev-overlay-context';

/** The strip of small pictures under the big one: it shows where you are and jumps to any of them. */
export function DevViewerThumbs({
  items,
  index,
  onSelect,
}: {
  items: ViewerItem[];
  index: number;
  onSelect: (index: number) => void;
}) {
  const copy = useCopy(devOverlaysCopy).viewer;
  const current = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    current.current?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [index]);

  return (
    <div
      className='absolute bottom-[14px] left-1/2 flex max-w-[calc(100%-130px)] -translate-x-1/2 animate-[dv-dockin_0.35s_cubic-bezier(0.2,0.8,0.2,1)_both] gap-[6px] overflow-x-auto rounded-[14px] border border-line-2 bg-[color-mix(in_srgb,var(--chrome)_70%,transparent)] px-[9px] pt-[11px] pb-[7px] shadow-[0_12px_32px_rgba(0,0,0,0.42)] backdrop-blur-[14px] backdrop-saturate-[1.4] [scrollbar-width:none] max-[700px]:max-w-[calc(100%-80px)]'
      role='group'
      aria-label={copy.pictures}
    >
      {items.map((item, i) => (
        <button
          key={`${item.src}-${i}`}
          ref={i === index ? current : undefined}
          type='button'
          aria-label={fill(copy.goTo, { current: i + 1, total: items.length })}
          aria-current={i === index || undefined}
          className={cn(
            'h-[38px] w-[50px] flex-none cursor-pointer overflow-hidden rounded-[7px] border-2 border-transparent bg-white p-0 opacity-60 [transition:opacity_0.15s,border-color_0.15s,transform_0.2s_cubic-bezier(0.3,1.6,0.5,1)] hover:opacity-100 hover:[transform:translateY(-5px)_scale(1.14)] pointer-coarse:h-11 pointer-coarse:w-14',
            i === index && 'border-signal opacity-100',
          )}
          onClick={() => onSelect(i)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- a thumbnail of the same file, sized by CSS */}
          <img
            src={item.src}
            alt=''
            loading='lazy'
            className='block size-full object-cover object-top'
          />
        </button>
      ))}
    </div>
  );
}
