/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Image from 'next/image';
import { shell } from '@/lib/content/shell';
import { initialsOf } from '@/lib/derive/initials';
import { cn } from '@/lib/utils';

/**
 * The owner's photo in a circle, or the letters of the name when the site has no photo. `className` sets the size (and the size of the
 * letters); `pixels` is the width of the picture to load, twice the drawn size. The photo is at the top of the page, so it loads first.
 */
export function OwnerAvatar({
  alt,
  pixels,
  className,
}: {
  alt: string;
  pixels: number;
  className: string;
}) {
  return shell.avatar ? (
    <Image
      src={shell.avatar}
      alt={alt}
      width={pixels}
      height={pixels}
      priority
      className={cn(
        'shrink-0 rounded-full bg-ph-sheet-3 object-cover',
        className,
      )}
    />
  ) : (
    <span
      aria-hidden='true'
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-ph-accent font-bold text-ph-on-accent',
        className,
      )}
    >
      {initialsOf(shell.name)}
    </span>
  );
}
