/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentNote } from '@/skins/travel/blocks/payment-note';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';
import { TlSkeletonBar } from '@/skins/travel/ui/tl-skeleton-bar';

/** The note and the two sections of the loaded page (the highlighted ticket, then one more way to pay); the words are real. */
export function PaymentSkeleton() {
  const copy = useCopy(paymentCopy);
  return (
    <>
      <PaymentNote />
      <section className='mt-6'>
        <h2 className='text-[17px] font-extrabold'>{copy.preferred}</h2>
        <div className='mt-3 grid grid-cols-1 gap-4'>
          <TlSkeleton
            data-skeleton='item'
            className='flex h-[206px] gap-3 rounded-3xl border border-tl-line bg-tl-panel-2 p-3.5'
          >
            <span className='grid grid-cols-1 min-w-0 flex-1 content-start gap-2'>
              <TlSkeletonBar className='h-3.5 w-24' />
              <TlSkeletonBar className='h-[23px] w-3/5' />
              <TlSkeletonBar className='h-[19px] w-4/5' />
              <TlSkeletonBar className='h-[19px] w-2/5' />
            </span>
            <TlSkeletonBar className='w-[112px] flex-none rounded-xl' />
          </TlSkeleton>
        </div>
      </section>
      <section className='mt-7'>
        <h2 className='text-[17px] font-extrabold'>{copy.more}</h2>
        <div className='mt-3 grid grid-cols-1 gap-3.5'>
          <TlSkeleton className='flex h-[144px] gap-3 rounded-3xl border border-tl-line bg-tl-panel-2 p-3.5'>
            <span className='grid grid-cols-1 min-w-0 flex-1 content-start gap-2'>
              <TlSkeletonBar className='h-3.5 w-24' />
              <TlSkeletonBar className='h-5 w-3/5' />
              <TlSkeletonBar className='h-4 w-4/5' />
            </span>
            <TlSkeletonBar className='w-[104px] flex-none rounded-xl' />
          </TlSkeleton>
        </div>
      </section>
    </>
  );
}
