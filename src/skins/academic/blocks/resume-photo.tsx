/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Image from 'next/image';
import { cn } from '@/lib/utils';

/** A picture taped to the board with a white border: the logo of a company or a school. */
export function ResumePhoto({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        'ac-tape relative m-0 w-full max-w-[220px] rotate-[-2deg] bg-ac-polaroid p-2 shadow-ac-photo even:rotate-[1.6deg]',
        className,
      )}
    >
      <div className='relative aspect-[4/3] overflow-hidden bg-ac-faint'>
        <Image
          src={src}
          alt={alt}
          fill
          sizes='220px'
          className='object-cover'
        />
      </div>
    </figure>
  );
}
