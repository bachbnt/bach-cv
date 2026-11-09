/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { AcButtonLink } from '@/skins/academic/ui/ac-button';
import { AcStateNotice } from '@/skins/academic/ui/ac-state-notice';

/** Shown when no method is switched on: it says payments are paused and sends the visitor to the contact form. */
export function PaymentEmpty() {
  const { empty } = useCopy(paymentCopy);
  return (
    <AcStateNotice
      kind='empty'
      title={empty.title}
      body={empty.body}
      className='mt-10'
    >
      <AcButtonLink href={empty.href}>{empty.action}</AcButtonLink>
    </AcStateNotice>
  );
}
