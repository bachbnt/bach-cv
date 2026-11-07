/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Image from 'next/image';
import { initialsOf } from '@/components/payment/payment-details';
import type { Doc } from '@/lib/content/schema';
import { cn } from '@/lib/utils';

/** The badge of a payment method, like the badge of a membership level: its logo, or its two letters when it has none (decoration). */
export function LibraryMethodMark({
  method,
  className,
}: {
  method: Doc<'payments'>;
  className?: string;
}) {
  return method.logo ? (
    <Image
      src={method.logo}
      alt=''
      width={48}
      height={48}
      unoptimized
      className={cn(
        'size-11 flex-none rounded-full bg-white object-cover',
        className,
      )}
    />
  ) : (
    <span
      aria-hidden='true'
      className={cn(
        'grid size-11 flex-none place-items-center rounded-full bg-sm-ink text-sm font-bold text-sm-bg',
        className,
      )}
    >
      {initialsOf(method.name)}
    </span>
  );
}
