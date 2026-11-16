/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useContentQuery } from '@/lib/query/use-content';
import { PaymentEmpty } from '@/skins/phone/blocks/payment-empty';
import { PaymentMethods } from '@/skins/phone/blocks/payment-methods';
import { PaymentSkeleton } from '@/skins/phone/blocks/payment-skeleton';
import { PhDataState } from '@/skins/phone/ui/ph-data-state';

/** The payment methods, read at run time only (the Firestore rules return the visible ones). With none switched on it says payments are paused. */
export function PaymentList() {
  const payments = useContentQuery('payments', { featuredFirst: true });
  const methods = payments.data ?? [];
  return (
    <PhDataState
      query={payments}
      count={methods.length}
      empty='services'
      emptyContent={<PaymentEmpty />}
      subject='payments'
      skeleton={<PaymentSkeleton />}
    >
      <PaymentMethods methods={methods} />
    </PhDataState>
  );
}
