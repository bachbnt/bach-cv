/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Award, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { certificatesCopy } from '@/content/copy/certificates';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/**
 * The picture of a certificate as a thumbnail that opens the preview: a frame with the ratio of the picture reserved (4:3, so the row does
 * not move while it loads), the whole picture inside it, and a magnifier that appears on hover. Without a picture the frame holds an award
 * mark and is not a button. The size comes from the parent through `className` (a width).
 */
export function CertThumb({
  item,
  onOpen,
  className,
}: {
  item: Doc<'certificates'>;
  onOpen: () => void;
  className?: string;
}) {
  const copy = useCopy(certificatesCopy);
  const frame =
    'relative block aspect-[4/3] w-full overflow-hidden rounded border border-tv-line bg-tv-hover';
  if (!item.image)
    return (
      <div
        aria-hidden='true'
        className={cn(frame, 'grid place-items-center text-tv-dim', className)}
      >
        <Award className='size-1/3' />
      </div>
    );
  return (
    <button
      type='button'
      onClick={onOpen}
      aria-label={copy.viewLabel(item.name)}
      className={cn(
        frame,
        'group/thumb cursor-zoom-in transition-[border-color,box-shadow] duration-200 outline-offset-2 hover:border-tv-accent hover:shadow-[0_4px_14px_rgba(0,0,0,0.3)] active:scale-[0.98] pointer-coarse:min-h-11',
        className,
      )}
    >
      <Image
        src={item.image}
        alt={copy.imageAlt(item.name)}
        fill
        sizes='(min-width: 560px) 240px, 120px'
        unoptimized
        className='object-contain transition-transform duration-500 ease-out group-hover/thumb:scale-[1.05]'
      />
      <span
        aria-hidden='true'
        className='absolute inset-0 grid place-items-center bg-tv-night/45 text-white opacity-0 transition-opacity duration-200 group-hover/thumb:opacity-100'
      >
        <ZoomIn className='size-5' />
      </span>
    </button>
  );
}
