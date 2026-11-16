/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Info } from 'lucide-react';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';

/** The note over the payment methods: the page's own words, so the skeleton shows it too. */
export function DeskPaymentNote() {
  const copy = useCopy(paymentCopy);
  return (
    <p
      role='note'
      className='flex items-start gap-2.5 rounded-md border border-tv-line border-l-2 border-l-tv-accent bg-tv-panel px-3 py-2.5 text-xs/[1.5]'
    >
      <Info
        className='mt-0.5 size-4 flex-none text-tv-accent-ink'
        aria-hidden='true'
      />
      <span>{copy.note}</span>
    </p>
  );
}
