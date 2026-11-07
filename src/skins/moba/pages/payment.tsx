/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentBoard } from '@/skins/moba/blocks/payment-board';
import { MbPageGate } from '@/skins/moba/ui/mb-page-gate';
import { MbPageHead } from '@/skins/moba/ui/mb-page-head';

/** Payment, at the vault: the methods as chests and coin purses, each with its number to copy and its QR code. */
export function PaymentPage() {
  const copy = useCopy(paymentCopy);
  return (
    <MbPageGate page='payment'>
      <MbPageHead title={copy.title} intro={copy.intro} />
      <PaymentBoard />
    </MbPageGate>
  );
}
