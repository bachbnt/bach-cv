/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { PhButtonLink } from '@/skins/phone/ui/ph-button';
import { PhStateNotice } from '@/skins/phone/ui/ph-state-notice';

/** Shown when no method is switched on: it says payments are paused and sends the visitor to the contact form. */
export function PaymentEmpty() {
  const { empty } = useCopy(paymentCopy);
  return (
    <PhStateNotice kind='empty' title={empty.title} body={empty.body}>
      <PhButtonLink variant='solid' href={empty.href}>
        {empty.action}
      </PhButtonLink>
    </PhStateNotice>
  );
}
