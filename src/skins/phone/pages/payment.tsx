/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentList } from '@/skins/phone/blocks/payment-list';
import { PhPage } from '@/skins/phone/ui/ph-page';

/** Payment in the Phone skin: Wallet, Payments. The methods with copy buttons, QR codes in the viewer and the paused note. */
export function PaymentPage() {
  const copy = useCopy(paymentCopy);
  return (
    <PhPage page='payment' title={copy.title} lead={copy.intro} wide>
      <PaymentList />
    </PhPage>
  );
}
