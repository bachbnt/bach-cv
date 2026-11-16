/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Info } from 'lucide-react';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';

/** The note above the methods: what to know before paying (the same words while the methods load). */
export function PaymentNote() {
  const copy = useCopy(paymentCopy);
  return (
    <p
      role='note'
      className='m-0 flex items-start gap-2.5 rounded-2xl border border-dashed border-tl-line bg-tl-panel-2 px-3.5 py-3 text-[13.5px]/[1.5]'
    >
      <Info
        className='mt-0.5 size-[18px] flex-none text-tl-coral'
        aria-hidden='true'
      />
      <span>{copy.note}</span>
    </p>
  );
}
