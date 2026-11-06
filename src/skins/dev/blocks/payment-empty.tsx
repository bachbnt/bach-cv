/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { DevStateNotice } from '@/skins/dev/ui/dev-state-notice';
import { DevButtonLink } from '@/skins/dev/ui/dev-button';

/** Shown when no method is switched on: it says payments are paused and sends the visitor to the contact form. */
export function PaymentEmpty() {
  const { empty } = useCopy(paymentCopy);
  return (
    <DevStateNotice
      kind='empty'
      title={empty.title}
      body={empty.body}
      className='mt-[54px]'
    >
      <DevButtonLink variant='solid' href={empty.href}>
        {empty.action}
      </DevButtonLink>
    </DevStateNotice>
  );
}
