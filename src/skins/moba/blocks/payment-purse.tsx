/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Copy, QrCode } from 'lucide-react';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentCoin } from '@/skins/moba/blocks/payment-coin';
import { PaymentFields } from '@/skins/moba/blocks/payment-fields';
import { MbButton } from '@/skins/moba/ui/mb-button';
import { MbChip } from '@/skins/moba/ui/mb-chip';

/** A method of "More ways to pay" as a coin purse: its coin, name and kind, the account, and Copy number and the QR button. */
export function PaymentPurse({
  method,
  onCopy,
  onOpenQr,
}: {
  method: Doc<'payments'>;
  onCopy: () => void;
  onOpenQr: () => void;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <li
      data-testid='payment-method'
      className='mb-plaque mb-purse @container/purse px-4 py-3.5'
    >
      <div className='grid items-center gap-x-5 gap-y-3 @[34rem]/purse:grid-cols-[minmax(0,1fr)_auto]'>
        <div className='flex min-w-0 items-center gap-3'>
          <PaymentCoin name={method.name} logo={method.logo} />
          <div className='min-w-0'>
            <h3 className='text-[20px] leading-tight mb-pay-title [overflow-wrap:anywhere]'>
              {method.name}
            </h3>
            <MbChip
              tone={method.kind === 'bank' ? 'gold' : 'teal'}
              className='mt-1.5'
            >
              {copy.kinds[method.kind]}
            </MbChip>
          </div>
        </div>
        <PaymentFields
          method={method}
          compact
          className='order-2 @[34rem]/purse:order-3 @[34rem]/purse:col-span-2'
        />
        <div className='order-3 flex flex-wrap items-center gap-2 @[34rem]/purse:order-2'>
          <MbButton
            variant='gold'
            size='sm'
            onClick={onCopy}
            className='mb-focus-in max-[479px]:flex-1'
          >
            <Copy aria-hidden='true' className='size-3.5' />
            {copy.copyNumber}
          </MbButton>
          {method.qr && (
            <MbButton
              variant='ghost'
              size='sm'
              onClick={onOpenQr}
              aria-label={copy.showQr(method.name)}
              className='mb-focus-in max-[479px]:flex-1'
            >
              <QrCode aria-hidden='true' className='size-3.5' />
              {copy.qrCode}
            </MbButton>
          )}
        </div>
      </div>
    </li>
  );
}
