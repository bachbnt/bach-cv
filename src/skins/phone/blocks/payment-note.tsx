/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Info } from 'lucide-react';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { PhCard } from '@/skins/phone/ui/ph-card';

/** The note about the account name, at the top of the page: it is words of the page, so the skeleton shows it too. */
export function PaymentNote() {
  const copy = useCopy(paymentCopy);
  return (
    <PhCard className='flex items-start gap-3 p-4'>
      <Info
        aria-hidden='true'
        className='mt-0.5 size-5 shrink-0 text-ph-accent-ink'
      />
      <p className='text-[15px]/[1.5]'>{copy.note}</p>
    </PhCard>
  );
}
