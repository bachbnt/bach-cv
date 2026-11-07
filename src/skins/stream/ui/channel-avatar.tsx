/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Image from 'next/image';
import { shell } from '@/lib/content/shell';
import { cn } from '@/lib/utils';

/** The picture of the channel: the owner's photo, as Standard shows it, in a circle (decoration: the name is always next to it). */
export function ChannelAvatar({
  size,
  className,
}: {
  /** the width and height of the picture in px, so the image is requested at the size it is drawn */
  size: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        'relative block flex-none overflow-hidden rounded-full bg-sm-hover',
        className,
      )}
    >
      {shell.avatar && (
        <Image
          src={shell.avatar}
          alt=''
          width={size}
          height={size}
          className='size-full object-cover object-[50%_35%]'
        />
      )}
    </span>
  );
}
