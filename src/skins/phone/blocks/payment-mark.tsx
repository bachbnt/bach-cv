/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Image from 'next/image';
import type { Doc } from '@/lib/content/schema';
import { methodInitials } from '@/lib/derive/initials';
import { cn } from '@/lib/utils';

/**
 * The logo of a method on a small white tile, or its two letters when it has none. It only decorates: the name is beside it. `onFace`
 * is the tile on the coloured face of a featured method.
 */
export function PaymentMark({
  method,
  onFace = false,
}: {
  method: Doc<'payments'>;
  onFace?: boolean;
}) {
  return method.logo ? (
    <Image
      src={method.logo}
      alt=''
      width={48}
      height={48}
      unoptimized
      className='size-11 flex-none rounded-ph-inner bg-ph-paper object-cover ring-1 ring-ph-line'
    />
  ) : (
    <span
      aria-hidden='true'
      className={cn(
        'grid size-11 flex-none place-items-center rounded-ph-inner text-[16px] font-bold',
        onFace
          ? 'bg-ph-on-tile/20 text-ph-on-tile'
          : 'bg-ph-accent/15 text-ph-accent-ink',
      )}
    >
      {methodInitials(method.name)}
    </span>
  );
}
