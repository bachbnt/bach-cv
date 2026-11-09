/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Image from 'next/image';
import { methodInitials } from '@/lib/derive/initials';
import type { Doc } from '@/lib/content/schema';

/** The logo of a method on a small white tile, or its two letters in chalk when it has none. It only decorates: the name is beside it. */
export function PaymentMark({ method }: { method: Doc<'payments'> }) {
  return method.logo ? (
    <Image
      src={method.logo}
      alt=''
      width={40}
      height={40}
      unoptimized
      className='size-10 flex-none rounded-[6px_9px_6px_9px] bg-white object-cover'
    />
  ) : (
    <span
      aria-hidden='true'
      className='grid size-10 flex-none place-items-center rounded-[6px_9px_6px_9px] border-2 border-ac-rule font-ac-chalk text-[20px]/none text-ac-accent'
    >
      {methodInitials(method.name)}
    </span>
  );
}
