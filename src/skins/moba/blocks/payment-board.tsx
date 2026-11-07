/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';
import { splitMethods } from '@/components/payment/payment-details';
import { mobaPaymentCopy } from '@/content/copy/moba-payment';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { usePaymentActions } from '@/skins/moba/blocks/payment-actions';
import { PaymentChest } from '@/skins/moba/blocks/payment-chest';
import { PaymentEmpty } from '@/skins/moba/blocks/payment-empty';
import {
  PaymentFilter,
  type PaymentFilterValue,
} from '@/skins/moba/blocks/payment-filter';
import { PaymentPurse } from '@/skins/moba/blocks/payment-purse';
import { MbCard } from '@/skins/moba/ui/mb-card';
import { MbDataState } from '@/skins/moba/ui/mb-data-state';
import { MbSection } from '@/skins/moba/ui/mb-section';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';

/**
 * The vault: the payment methods are read at run time only (the rules return the visible ones). Loading, a lost connection and "payments
 * are paused" (no method on) have their own cards.
 */
export function PaymentBoard() {
  const query = useContentQuery('payments', { featuredFirst: true });
  const methods = query.data ?? [];
  return (
    <MbDataState
      query={query}
      count={methods.length}
      empty='services'
      emptyContent={<PaymentEmpty />}
      subject='payments'
      className='px-6 py-4 max-[719px]:px-4'
      skeleton={
        <div className='grid gap-3'>
          <MbSkeleton className='h-[230px]' />
          <MbSkeleton className='h-[110px]' />
        </div>
      }
    >
      <PaymentMethods methods={methods} />
    </MbDataState>
  );
}

/** The note, then the preferred methods as chests, then "More ways to pay" as coin purses with a bank / wallet filter. */
function PaymentMethods({ methods }: { methods: Doc<'payments'>[] }) {
  const copy = useCopy(paymentCopy);
  const mb = useCopy(mobaPaymentCopy);
  const [filter, setFilter] = useState<PaymentFilterValue>('all');
  const { featured, rest } = splitMethods(methods);
  // the viewer steps through every method that has a QR code, in the order of the page, whatever the filter shows
  const withQr = [...featured, ...rest].filter((m) => m.qr);
  const { copyAccount, copyAll, openQr } = usePaymentActions(withQr);
  const shown = rest.filter((m) => filter === 'all' || m.kind === filter);
  return (
    <>
      <div className='px-6 pt-1 pb-2 max-[719px]:px-4'>
        <MbCard className='flex max-w-[640px] items-start gap-3 px-4 py-3.5'>
          <Info
            aria-hidden='true'
            className='mt-0.5 size-5 flex-none text-mb-teal-ink'
          />
          <p className='text-[14.5px] leading-normal text-mb-ink/90'>
            <span className='mb-1 block text-[10px] leading-none font-bold tracking-[0.22em] text-mb-teal-ink uppercase'>
              {mb.kickers.notice}
            </span>
            {copy.note}
          </p>
        </MbCard>
      </div>
      {featured.length > 0 && (
        <MbSection
          id='pay-featured'
          kicker={mb.kickers.chests}
          title={rest.length ? copy.preferred : copy.details}
          order={1}
        >
          <div className='grid gap-3'>
            {featured.map((m) => (
              <PaymentChest
                key={m.id}
                method={m}
                onCopy={() => void copyAccount(m)}
                onCopyAll={() => void copyAll(m)}
                onOpenQr={() => openQr(m)}
              />
            ))}
          </div>
        </MbSection>
      )}
      {rest.length > 0 && (
        <MbSection
          id='pay-more'
          kicker={mb.kickers.purses}
          title={featured.length ? copy.more : copy.details}
          order={2}
          className='pb-10'
        >
          <PaymentFilter rest={rest} value={filter} onChange={setFilter} />
          <ul role='list' className='m-0 grid list-none gap-3 p-0'>
            {shown.map((m) => (
              <PaymentPurse
                key={m.id}
                method={m}
                onCopy={() => void copyAccount(m)}
                onOpenQr={() => openQr(m)}
              />
            ))}
          </ul>
        </MbSection>
      )}
    </>
  );
}
