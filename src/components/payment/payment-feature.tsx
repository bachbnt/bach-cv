/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Copy, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { PaymentFields } from '@/components/payment/payment-fields';
import { Button } from '@/components/ui/button';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';

/** A highlighted method: big QR on the left (opens the zoom dialog), details and copy buttons on the right. */
export function PaymentFeature({
  method,
  onCopy,
  onOpenQr,
}: {
  method: Doc<'payments'>;
  onCopy: (kind: 'account' | 'all') => void;
  onOpenQr: () => void;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <article
      data-testid='payment-method'
      className='flex items-center gap-6 rounded-3xl border bg-white p-5 max-[720px]:flex-col max-[720px]:items-stretch'
    >
      {method.qr && (
        <button
          type='button'
          onClick={onOpenQr}
          aria-label={copy.enlargeQr(method.name)}
          className='group/qr relative flex w-[190px] flex-none cursor-zoom-in items-center justify-center rounded-xl bg-muted p-3 outline-none max-[720px]:w-full max-[720px]:max-w-[260px] max-[720px]:self-center'
        >
          <Image
            src={method.qr}
            alt={copy.qrAlt(method.name)}
            width={240}
            height={240}
            unoptimized
            className='block h-auto max-h-60 w-full rounded-md bg-white object-contain transition-transform duration-300 group-hover/qr:scale-[1.03] motion-reduce:transition-none'
          />
          <span
            aria-hidden='true'
            className='absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-night text-white transition-opacity max-[720px]:opacity-100 min-[721px]:opacity-0 group-hover/qr:opacity-100 group-focus-visible/qr:opacity-100 pointer-coarse:opacity-100'
          >
            <ZoomIn className='size-4' />
          </span>
        </button>
      )}
      <div className='flex min-w-0 flex-col gap-3'>
        <span className='inline-flex items-center self-start whitespace-nowrap rounded-full bg-page-tint px-2.5 py-[3px] text-[13px] font-semibold text-page'>
          {copy.kinds[method.kind]}
        </span>
        <h3 className='text-[28px] leading-[1.1]'>{method.name}</h3>
        <PaymentFields method={method} />
        <div className='mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-2 max-[720px]:w-full'>
          <Button
            onClick={() => onCopy('account')}
            className='border-[1.5px] border-night max-[720px]:flex-1 pointer-coarse:h-11'
          >
            <Copy aria-hidden='true' />
            {copy.copyAccount}
          </Button>
          <Button
            variant='link'
            onClick={() => onCopy('all')}
            className='px-0 pointer-coarse:h-11'
          >
            {copy.copyAll}
          </Button>
        </div>
      </div>
    </article>
  );
}
