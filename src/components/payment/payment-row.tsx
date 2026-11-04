/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Copy, QrCode } from 'lucide-react';
import Image from 'next/image';
import { initialsOf } from '@/components/payment/payment-details';
import { PaymentFields } from '@/components/payment/payment-fields';
import { Button } from '@/components/ui/button';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';

/** A method in "More ways to pay": name, aligned fields, and the two actions on one line. */
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
    <li
      data-testid='payment-method'
      className='grid grid-cols-1 items-center gap-x-6 gap-y-3 rounded-2xl border bg-white px-5 py-4 min-[721px]:grid-cols-[minmax(0,1fr)_auto] min-[901px]:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]'
    >
      <div className='flex min-w-0 items-center gap-3.5'>
        {method.logo ? (
          <Image
            src={method.logo}
            alt=''
            width={44}
            height={44}
            unoptimized
            className='size-11 flex-none rounded-xl bg-page-tint object-contain'
          />
        ) : (
          <span
            aria-hidden='true'
            className='flex size-11 flex-none items-center justify-center rounded-xl bg-page-tint font-heading text-base font-bold text-page'
          >
            {initialsOf(method.name)}
          </span>
        )}
        <div className='min-w-0'>
          <h3 className='text-lg leading-tight'>{method.name}</h3>
          <span className='mt-1 inline-flex items-center self-start whitespace-nowrap rounded-full bg-page-tint px-2.5 py-[3px] text-[13px] font-semibold text-page'>
            {copy.kinds[method.kind]}
          </span>
        </div>
      </div>
      <PaymentFields method={method} compact />
      <div className='flex flex-wrap items-center gap-2 max-[720px]:w-full'>
        <Button
          onClick={onCopy}
          className='border-[1.5px] border-night max-[720px]:flex-1 pointer-coarse:h-11'
        >
          <Copy aria-hidden='true' />
          {copy.copyNumber}
        </Button>
        {method.qr && (
          <Button
            variant='outline'
            onClick={onOpenQr}
            aria-label={copy.showQr(method.name)}
            className='max-[720px]:flex-1 pointer-coarse:h-11'
          >
            <QrCode aria-hidden='true' />
            {copy.qrCode}
          </Button>
        )}
      </div>
    </li>
  );
}
