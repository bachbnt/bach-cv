/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Wallet } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';

/** Shown when no method is switched on. Sends the visitor to the contact form on Services instead. */
export function PaymentEmpty() {
  const copy = useCopy(paymentCopy);
  const { empty } = copy;
  return (
    <div className='mt-12 flex max-w-[640px] flex-col items-start gap-5 rounded-3xl border bg-white p-8'>
      <span
        aria-hidden='true'
        className='flex size-14 items-center justify-center rounded-2xl bg-page-tint text-page'
      >
        <Wallet className='size-7' strokeWidth={1.8} />
      </span>
      <div>
        <h2 className='mb-2 text-[28px]'>{empty.title}</h2>
        <p className='text-base leading-[1.6] text-[#3a404c]'>{empty.body}</p>
      </div>
      <Link href={empty.href} className={buttonVariants()}>
        {empty.action}
      </Link>
    </div>
  );
}
