/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { DeskPayment } from '@/skins/trade/blocks/desk-payment';
import { TvPage } from '@/skins/trade/ui/tv-page';
import { TvPanel } from '@/skins/trade/ui/tv-panel';

/** Payment in the Trade skin: the methods to pay with as a deposit table, the recommended one first, or the paused notice. */
export function PaymentPage() {
  const copy = useCopy(paymentCopy);
  return (
    <TvPage page='payment'>
      <TvPanel title={copy.title} intro={copy.intro}>
        <DeskPayment />
      </TvPanel>
    </TvPage>
  );
}
