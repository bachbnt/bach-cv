/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentNote } from '@/skins/dev/blocks/payment-note';
import { DevSection } from '@/skins/dev/ui/dev-section';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevSkeletonBar } from '@/skins/dev/ui/dev-skeleton-bar';

/** The note and the two sections of the loaded page (the highlighted method with its QR code, then one more way to pay); the words are real. */
export function PaymentSkeleton() {
  const copy = useCopy(paymentCopy);
  return (
    <>
      <PaymentNote />
      <DevSection title={copy.preferred}>
        <div className='grid gap-[18px]'>
          <DevSkeleton
            data-skeleton='item'
            className='grid max-w-[760px] min-w-0 grid-cols-[230px_1fr] items-center gap-[22px] p-4 max-[900px]:grid-cols-[1fr]'
          >
            <DevSkeletonBar className='aspect-square w-full max-[620px]:max-w-[260px] max-[620px]:justify-self-center' />
            <div className='grid min-h-[196px] min-w-0 content-center gap-3 min-[901px]:max-[1279px]:min-h-[266px]'>
              <DevSkeletonBar className='h-[21px] w-16 rounded-full' />
              <DevSkeletonBar className='h-[31px] w-3/5' />
              <DevSkeletonBar className='h-[19px] w-4/5' />
              <DevSkeletonBar className='h-[19px] w-2/5' />
              <DevSkeletonBar className='h-8 w-40' />
            </div>
          </DevSkeleton>
        </div>
      </DevSection>
      <DevSection title={copy.more}>
        <DevSkeleton className='h-[84px] max-[1279px]:h-[113px] max-[900px]:h-[207px] max-[620px]:h-[267px]'>
          <div className='flex items-center gap-3 px-5 py-3.5'>
            <DevSkeletonBar className='size-11 flex-none rounded-[10px]' />
            <DevSkeletonBar className='h-[22px] w-40' />
          </div>
        </DevSkeleton>
      </DevSection>
    </>
  );
}
