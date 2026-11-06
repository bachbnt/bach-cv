/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useContentQuery } from '@/lib/query/use-content';
import { PaymentEmpty } from '@/skins/dev/blocks/payment-empty';
import { PaymentMethods } from '@/skins/dev/blocks/payment-methods';
import { DevDataState } from '@/skins/dev/ui/dev-data-state';
import { DevCardsSkeleton } from '@/skins/dev/ui/dev-skeleton';

/**
 * The payment methods, read at run time only. With none switched on it says payments are paused.
 */
export function PaymentList() {
  const payments = useContentQuery('payments', { featuredFirst: true });
  const methods = payments.data ?? [];
  return (
    <DevDataState
      query={payments}
      count={methods.length}
      empty='services'
      emptyContent={<PaymentEmpty />}
      subject='payments'
      skeleton={
        <DevCardsSkeleton
          count={1}
          min={320}
          height={260}
          className='max-w-[760px]'
        />
      }
      className='mt-[54px]'
    >
      <PaymentMethods methods={methods} />
    </DevDataState>
  );
}
