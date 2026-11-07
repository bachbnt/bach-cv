/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Image from 'next/image';
import { methodInitials } from '@/lib/derive/initials';
import { cn } from '@/lib/utils';

/** The coin of a method: its logo, or two letters when it has none. Decoration: the name beside it names the method. */
export function PaymentCoin({
  name,
  logo,
  className,
}: {
  name: string;
  logo: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden='true'
      className={cn('mb-coin relative block size-12 flex-none', className)}
    >
      <span className='mb-coin-face absolute inset-[3px] grid place-items-center overflow-hidden rounded-full font-mb-display text-[16px] font-bold text-mb-title'>
        {logo ? (
          <Image
            src={logo}
            alt=''
            fill
            sizes='48px'
            unoptimized
            className='bg-white object-cover'
          />
        ) : (
          methodInitials(name)
        )}
      </span>
    </span>
  );
}
