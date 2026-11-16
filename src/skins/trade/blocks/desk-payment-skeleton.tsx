/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DeskPaymentNote } from '@/skins/trade/blocks/desk-payment-note';
import { PAYMENT_COLUMNS } from '@/skins/trade/blocks/desk-payment-row';
import { DeskSection } from '@/skins/trade/blocks/desk-section';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/**
 * The payment methods while they load, laid out as the loaded page is: the note, the section of the preferred methods with a card, and the
 * section of the other ways to pay with its column names and a row, each with its real title (two methods, as a typical page has). The card
 * is taller where the box is narrow, and the row is a block of lines under 760px.
 */
export function DeskPaymentSkeleton() {
  const copy = useCopy(paymentCopy);
  const desk = useCopy(tradeDeskCopy).payment;
  return (
    <div className='@container grid gap-3'>
      <DeskPaymentNote />
      <DeskSection id='tv-pay-featured' title={copy.preferred}>
        <TvSkeleton data-skeleton='item' className='h-[356px] @xl:h-[212px]' />
      </DeskSection>
      <DeskSection id='tv-pay-more' title={copy.more} bodyClassName='p-0'>
        <div
          aria-hidden='true'
          className={cn(
            'hidden gap-x-4 border-b border-tv-line px-3 py-1.5 text-[11px] text-tv-mute @[760px]:grid',
            PAYMENT_COLUMNS,
          )}
        >
          <span>{desk.method}</span>
          <span>{copy.accountName}</span>
          <span>{copy.accountNumber}</span>
          <span />
        </div>
        <TvSkeleton className='h-[181px] rounded-none border-0 @[760px]:h-[58px]' />
      </DeskSection>
    </div>
  );
}
