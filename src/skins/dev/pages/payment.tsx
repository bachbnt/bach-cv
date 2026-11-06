/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentList } from '@/skins/dev/blocks/payment-list';
import { DevPage } from '@/skins/dev/ui/dev-page';
import { DevPageHead } from '@/skins/dev/ui/dev-page-head';

/** Payment in the Dev skin: the methods, with copy buttons, QR codes in the picture viewer and the paused state. */
export function PaymentPage() {
  const copy = useCopy(paymentCopy);
  return (
    <DevPage page='payment'>
      <DevPageHead page='payment' title={copy.title} intro={copy.intro} />
      <PaymentList />
    </DevPage>
  );
}
