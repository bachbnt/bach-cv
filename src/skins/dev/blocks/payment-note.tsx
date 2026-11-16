/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { DevIcon } from '@/skins/dev/icons/dev-icon';

/** The note above the methods: what to know before paying (the same words while the methods load). */
export function PaymentNote() {
  const copy = useCopy(paymentCopy);
  return (
    <p
      className='mt-5 flex max-w-[740px] items-start gap-2.5 rounded-[8px] border border-dashed border-line-2 bg-chrome px-[17px] py-[13px] font-sans text-[14.5px]/[1.6] font-normal text-mute'
      data-reveal
    >
      <DevIcon name='info' className='mt-[3px] flex-none text-signal' />
      <span>{copy.note}</span>
    </p>
  );
}
