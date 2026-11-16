/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Copy, QrCode } from 'lucide-react';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentFields } from '@/skins/phone/blocks/payment-fields';
import { PaymentMark } from '@/skins/phone/blocks/payment-mark';
import { PhButton } from '@/skins/phone/ui/ph-button';

/** The row of a method: stacked on a phone, three columns (name, details, actions) on a tablet. */
export const PAYMENT_ROW =
  'flex flex-col gap-3.5 p-4 @min-[900px]:grid @min-[900px]:grid-cols-[minmax(11rem,0.8fr)_minmax(0,1.5fr)_auto] @min-[900px]:items-center @min-[900px]:gap-x-6';
/** The name of a method with its logo. */
export const PAYMENT_ROW_NAME = 'flex min-h-14 min-w-0 items-center gap-3.5';
/** The list of a group of rows: one card, the rows divided by a hairline. */
export const PAYMENT_GROUP_LIST =
  'm-0 grid list-none divide-y divide-ph-line overflow-hidden rounded-ph-panel bg-ph-sheet-2 p-0 shadow-ph-card';

/** A method in "More ways to pay": the logo and name, the details, and the two actions (Copy number, and the QR code when it has one). */
export function PaymentRow({
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
    <li data-testid='payment-method' className={PAYMENT_ROW}>
      <div className={PAYMENT_ROW_NAME}>
        <PaymentMark method={method} />
        <h4 className='min-w-0 text-[18px]/[1.25] font-bold [overflow-wrap:anywhere]'>
          {method.name}
        </h4>
      </div>
      <PaymentFields method={method} />
      <div className='flex flex-wrap gap-2'>
        <PhButton
          variant='solid'
          onClick={onCopy}
          className='min-w-[9.5rem] flex-1'
        >
          <Copy aria-hidden='true' className='size-4' />
          {copy.copyNumber}
        </PhButton>
        {method.qr && (
          <PhButton
            variant='tonal'
            onClick={onOpenQr}
            aria-label={copy.showQr(method.name)}
            className='min-w-[9.5rem] flex-1'
          >
            <QrCode aria-hidden='true' className='size-4' />
            <span aria-hidden='true'>{copy.qrCode}</span>
          </PhButton>
        )}
      </div>
    </li>
  );
}
