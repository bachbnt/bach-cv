/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Info } from 'lucide-react';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';

/** The note under the title of the Payment page; the skeleton shows it too, it is not data. */
export function PaymentNote() {
  const copy = useCopy(paymentCopy);
  return (
    <p className='mt-7 flex max-w-[720px] items-start gap-3 rounded-xl border bg-card px-4 py-3.5 text-[15px] leading-normal text-body'>
      <Info className='mt-0.5 size-5 flex-none text-page' aria-hidden='true' />
      <span>{copy.note}</span>
    </p>
  );
}
