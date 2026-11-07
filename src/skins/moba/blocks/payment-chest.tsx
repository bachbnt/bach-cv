/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Copy, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentCoin } from '@/skins/moba/blocks/payment-coin';
import { PaymentFields } from '@/skins/moba/blocks/payment-fields';
import { MbButton } from '@/skins/moba/ui/mb-button';
import { MbChip } from '@/skins/moba/ui/mb-chip';

/**
 * A preferred method as a treasure chest: its QR code on a gold plate (it opens the viewer), then the kind, name, account and the two
 * ways to copy. A chest with no QR code is the details alone.
 */
export function PaymentChest({
  method,
  onCopy,
  onCopyAll,
  onOpenQr,
}: {
  method: Doc<'payments'>;
  onCopy: () => void;
  onCopyAll: () => void;
  onOpenQr: () => void;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <article
      data-testid='payment-method'
      className='mb-plaque mb-chest @container/chest p-5 pt-7'
    >
      <div className='flex flex-col gap-5 @[30rem]/chest:flex-row @[30rem]/chest:items-center'>
        {method.qr && (
          <button
            type='button'
            onClick={onOpenQr}
            aria-label={copy.enlargeQr(method.name)}
            className='mb-qr-plate group/qr relative block w-full max-w-[220px] flex-none cursor-zoom-in self-center p-2.5 @[30rem]/chest:w-[200px] @[30rem]/chest:self-auto'
          >
            <span className='relative block aspect-square w-full bg-white'>
              <Image
                src={method.qr}
                alt={copy.qrAlt(method.name)}
                fill
                sizes='220px'
                unoptimized
                className='object-contain p-1.5'
              />
            </span>
            <span
              aria-hidden='true'
              className='absolute right-3.5 bottom-3.5 inline-flex items-center gap-1 bg-mb-well/90 px-2 py-1 text-[11px] font-bold tracking-wide text-mb-gold-ink'
            >
              <ZoomIn className='size-3' />
              {copy.enlarge}
            </span>
          </button>
        )}
        <div className='flex min-w-0 flex-1 flex-col gap-3'>
          <div className='flex min-w-0 items-center gap-3'>
            <PaymentCoin name={method.name} logo={method.logo} />
            <div className='min-w-0'>
              <MbChip tone={method.kind === 'bank' ? 'gold' : 'teal'}>
                {copy.kinds[method.kind]}
              </MbChip>
              <h3 className='mt-1.5 text-[28px] leading-[1.05] mb-pay-title [overflow-wrap:anywhere]'>
                {method.name}
              </h3>
            </div>
          </div>
          <PaymentFields method={method} large />
          <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-2'>
            <MbButton
              variant='gold'
              onClick={onCopy}
              className='mb-focus-in max-[479px]:flex-1'
            >
              <Copy aria-hidden='true' className='size-4' />
              {copy.copyNumber}
            </MbButton>
            <MbButton
              variant='ghost'
              onClick={onCopyAll}
              className='mb-focus-in max-[479px]:flex-1'
            >
              {copy.copyAll}
            </MbButton>
          </div>
        </div>
      </div>
    </article>
  );
}
