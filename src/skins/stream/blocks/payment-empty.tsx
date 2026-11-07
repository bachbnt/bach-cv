/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { StreamButtonLink } from '@/skins/stream/ui/stream-button';
import { StreamStateNotice } from '@/skins/stream/ui/stream-state-notice';

/** The card for a site that takes no payments for now: Standard's words and its way forward. */
export function PaymentEmpty() {
  const { empty } = useCopy(paymentCopy);
  return (
    <StreamStateNotice
      kind='empty'
      title={empty.title}
      body={empty.body}
      className='mt-6'
    >
      <StreamButtonLink variant='solid' href={empty.href}>
        {empty.action}
      </StreamButtonLink>
    </StreamStateNotice>
  );
}
