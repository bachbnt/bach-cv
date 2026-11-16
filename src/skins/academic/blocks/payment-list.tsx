/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useContentQuery } from '@/lib/query/use-content';
import { PaymentEmpty } from '@/skins/academic/blocks/payment-empty';
import { PaymentSkeleton } from '@/skins/academic/blocks/payment-skeleton';
import { PaymentMethods } from '@/skins/academic/blocks/payment-methods';
import { AcDataState } from '@/skins/academic/ui/ac-data-state';

/** The payment methods, read at run time only (the Firestore rules return the visible ones). With none switched on it says payments are paused. */
export function PaymentList() {
  const payments = useContentQuery('payments', { featuredFirst: true });
  const methods = payments.data ?? [];
  return (
    <AcDataState
      query={payments}
      count={methods.length}
      empty='services'
      emptyContent={<PaymentEmpty />}
      subject='payments'
      skeleton={<PaymentSkeleton />}
      skeletonClassName=''
      className='mt-10'
    >
      <PaymentMethods methods={methods} />
    </AcDataState>
  );
}
