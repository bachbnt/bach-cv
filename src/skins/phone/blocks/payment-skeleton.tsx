/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { HINGE_PANES } from '@/skins/phone/blocks/hinge-panes';
import {
  PAYMENT_ACTIONS,
  PAYMENT_ACTIONS_QR,
  PAYMENT_CARD,
  PAYMENT_FEATURE,
} from '@/skins/phone/blocks/payment-feature';
import { PaymentNote } from '@/skins/phone/blocks/payment-note';
import { PaymentPart } from '@/skins/phone/blocks/payment-part';
import {
  PAYMENT_GROUP_LIST,
  PAYMENT_ROW,
  PAYMENT_ROW_NAME,
} from '@/skins/phone/blocks/payment-row';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/**
 * The Payment page before its methods are read: the note and the two titles are the page's own words, then a highlighted method (the card,
 * the QR code and the buttons) and a group with a row, in the same grids as the loaded page. The seed has one of each.
 */
export function PaymentSkeleton() {
  const copy = useCopy(paymentCopy);
  return (
    <>
      <PaymentNote />
      <PaymentPart title={copy.preferred}>
        <div aria-hidden='true' className={cn(PAYMENT_FEATURE, HINGE_PANES)}>
          <div
            className={cn(
              PAYMENT_CARD,
              'flex min-w-0 flex-col justify-between gap-4 rounded-ph-panel bg-ph-sheet-3 p-5',
            )}
          >
            <div className='flex items-center gap-3'>
              <PhSkeleton className='size-11 shrink-0 rounded-ph-inner bg-ph-line' />
              <PhSkeleton className='h-5 w-1/3 bg-ph-line' />
            </div>
            <PhSkeleton className='h-8 w-11 rounded-ph-mark bg-ph-line' />
            <div className='flex flex-col gap-3'>
              <PhSkeleton className='h-6 w-3/5 bg-ph-line' />
              <PhSkeleton className='h-4 w-2/5 bg-ph-line' />
            </div>
          </div>
          <div className={cn(PAYMENT_ACTIONS, PAYMENT_ACTIONS_QR)}>
            <PhSkeleton className='size-[120px] justify-self-center rounded-ph-inner @min-[360px]:justify-self-auto' />
            <div className='flex min-w-0 flex-col gap-2'>
              <PhSkeleton className='h-11' />
              <PhSkeleton className='h-11' />
            </div>
          </div>
        </div>
      </PaymentPart>
      <PaymentPart title={copy.more}>
        <div aria-hidden='true' className='mt-5'>
          <div className='mb-2.5 px-1'>
            <PhSkeletonLine line='h-[13px]' className='w-14' />
          </div>
          <ul className={PAYMENT_GROUP_LIST}>
            <li className={PAYMENT_ROW}>
              <div className={PAYMENT_ROW_NAME}>
                <PhSkeleton className='size-11 shrink-0 rounded-ph-inner' />
                <PhSkeleton className='h-5 w-24' />
              </div>
              <div className='grid gap-2 @min-[900px]:grid-cols-2 @min-[900px]:gap-x-6'>
                <div className='min-w-0'>
                  <PhSkeletonLine line='h-[17px]' className='w-24' />
                  <PhSkeletonLine line='h-[22px]' className='w-32' />
                </div>
                <div className='min-w-0'>
                  <PhSkeletonLine line='h-[17px]' className='w-24' />
                  <PhSkeletonLine line='h-[24px]' className='w-36' />
                </div>
              </div>
              <div className='flex flex-wrap gap-2'>
                <PhSkeleton className='h-11 min-w-[9.5rem] flex-1' />
                <PhSkeleton className='h-11 min-w-[9.5rem] flex-1' />
              </div>
            </li>
          </ul>
        </div>
      </PaymentPart>
    </>
  );
}
