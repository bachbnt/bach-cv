/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentList } from '@/skins/academic/blocks/payment-list';
import { AcPage } from '@/skins/academic/ui/ac-page';
import { AcPageHead } from '@/skins/academic/ui/ac-page-head';

/** Payment in the Academic skin ("Funding" in the manuscript): the methods with copy buttons, QR codes in the viewer and the paused note. */
export function PaymentPage() {
  const copy = useCopy(paymentCopy);
  return (
    <AcPage page='payment'>
      <AcPageHead page='payment' title={copy.title} lead={copy.intro} />
      <PaymentList />
    </AcPage>
  );
}
