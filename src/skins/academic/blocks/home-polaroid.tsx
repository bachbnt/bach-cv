/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Image from 'next/image';
import { cn } from '@/lib/utils';

/** A photograph taped to the board with its caption written under it. The frame the picture fills has the size, so the image never fights its own width and height. */
export function HomePolaroid({
  src,
  alt,
  caption,
  tilt = -2,
  aspect = 'aspect-square',
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  caption?: string;
  tilt?: number;
  aspect?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure
      style={{ rotate: `${tilt}deg` }}
      className={cn(
        'ac-tape relative m-0 bg-ac-polaroid p-2 pb-8 shadow-[0_7px_16px_rgba(0,0,0,0.38)]',
        className,
      )}
    >
      <div
        className={cn('relative w-full overflow-hidden bg-ac-faint', aspect)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className='object-cover object-[50%_30%]'
        />
      </div>
      {caption && (
        <figcaption className='absolute inset-x-1.5 bottom-1 truncate text-center font-ac-note text-[18px]/[1.1] text-ac-sheet-ink'>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
