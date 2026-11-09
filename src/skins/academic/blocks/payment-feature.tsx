/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useId } from 'react';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentFields } from '@/skins/academic/blocks/payment-fields';
import { PaymentKind } from '@/skins/academic/blocks/payment-kind';
import { AcButton } from '@/skins/academic/ui/ac-button';
import { AcPaper } from '@/skins/academic/ui/ac-paper';

/** A highlighted method: an index card taped to the board, the QR code on a photo at its left (it opens the viewer), the details and the copy buttons at its right. */
export function PaymentFeature({
  method,
  onCopy,
  onOpenQr,
}: {
  method: Doc<'payments'>;
  onCopy: (what: 'account' | 'all') => void;
  onOpenQr: () => void;
}) {
  const copy = useCopy(paymentCopy);
  const id = useId();
  return (
    <AcPaper
      kind='card'
      role='article'
      aria-labelledby={id}
      data-testid='payment-method'
    >
      <div className='flex flex-wrap items-center gap-7 max-[640px]:flex-col max-[640px]:items-stretch'>
        {method.qr && (
          <button
            type='button'
            onClick={onOpenQr}
            aria-label={copy.enlargeQr(method.name)}
            className='ac-wind group/qr relative block w-[176px] flex-none -rotate-[1.4deg] cursor-zoom-in border-0 bg-ac-polaroid px-2 pt-2 pb-9 text-ac-sheet-ink shadow-ac-photo max-[640px]:self-center'
          >
            <Image
              src={method.qr}
              alt={copy.qrAlt(method.name)}
              width={240}
              height={240}
              unoptimized
              className='block h-auto w-full bg-white object-contain'
            />
            <span
              aria-hidden='true'
              className='absolute inset-x-1.5 bottom-[5px] text-center font-ac-note text-[19px]/[1.1]'
            >
              {copy.enlarge}
            </span>
          </button>
        )}
        <div className='min-w-0 flex-1'>
          <PaymentKind>{copy.kinds[method.kind]}</PaymentKind>
          <h3
            id={id}
            className='mt-1.5 mb-2 font-ac-chalk text-[32px]/[1.1] font-normal [overflow-wrap:anywhere]'
          >
            {method.name}
          </h3>
          <PaymentFields method={method} />
          <div className='mt-4 flex flex-wrap items-center gap-x-4 gap-y-2'>
            <AcButton onClick={() => onCopy('account')}>
              {copy.copyNumber}
            </AcButton>
            <AcButton variant='quiet' onClick={() => onCopy('all')}>
              {copy.copyAll}
            </AcButton>
          </div>
        </div>
      </div>
    </AcPaper>
  );
}
