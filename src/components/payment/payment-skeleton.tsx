/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { PaymentNote } from '@/components/payment/payment-note';
import { Skeleton } from '@/components/ui/skeleton';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';

const HEADING = 'text-[30px] min-[721px]:text-[40px]';

/** The page as it will be: the note and the two headings are real, under them the account card and a row of the list. */
export function PaymentSkeleton() {
  const copy = useCopy(paymentCopy);
  return (
    <>
      <PaymentNote />
      <section className='mt-14'>
        <h2 className={HEADING}>{copy.preferred}</h2>
        <div className='mt-6 grid grid-cols-1 min-[721px]:grid-cols-[minmax(0,720px)]'>
          <Skeleton className='h-[574px] rounded-3xl bg-card min-[721px]:h-[286px]' />
        </div>
      </section>
      <section className='mt-14'>
        <h2 className={HEADING}>{copy.more}</h2>
        <div className='mt-6 flex flex-col gap-3'>
          <Skeleton className='h-[201px] rounded-2xl bg-card min-[721px]:h-[86px]' />
        </div>
      </section>
    </>
  );
}
