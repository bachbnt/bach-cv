/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Copy, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { useId } from 'react';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { PaymentChip } from '@/skins/phone/blocks/payment-chip';
import { PaymentContactless } from '@/skins/phone/blocks/payment-contactless';
import { PaymentFields } from '@/skins/phone/blocks/payment-fields';
import { PaymentMark } from '@/skins/phone/blocks/payment-mark';
import { PhButton } from '@/skins/phone/ui/ph-button';
import { HINGE_PANES } from '@/skins/phone/blocks/hinge-panes';

/** The layout of a highlighted method: the card, and the QR code with the copy buttons under it (at its side on a tablet). */
export const PAYMENT_FEATURE =
  'grid grid-cols-[minmax(0,1fr)] gap-4 @min-[900px]:grid-cols-2 @min-[900px]:items-center @min-[900px]:gap-8';
/** The card of a method: at least 240 px tall, the shape of a bank card on a tablet. */
export const PAYMENT_CARD = 'min-h-60 @min-[900px]:aspect-[1.586]';
/** The block with the QR code and the copy buttons. */
export const PAYMENT_ACTIONS =
  'grid gap-3 rounded-ph-panel bg-ph-sheet-2 p-4 shadow-ph-card';
/** With a QR code the block has two columns. */
export const PAYMENT_ACTIONS_QR =
  '@min-[360px]:grid-cols-[120px_minmax(0,1fr)] @min-[360px]:items-center';

/**
 * A highlighted method as a bank card of the Wallet: the face of a card (the logo, the name, the kind, a chip and the details, with the
 * gloss of its glass), and under it, or at its side on a tablet, the QR code (it opens the viewer) and the two copy buttons.
 */
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
    <article
      data-testid='payment-method'
      aria-labelledby={id}
      className={cn(PAYMENT_FEATURE, HINGE_PANES)}
    >
      <div
        className={cn(
          PAYMENT_CARD,
          'relative flex min-w-0 flex-col justify-between gap-4 rounded-ph-panel bg-linear-to-br from-ph-tile-payment-b to-ph-tile-about-b p-5 text-ph-on-tile shadow-ph-card ring-1 ring-ph-on-tile/20 ring-inset',
        )}
      >
        {/* the gloss: a light across the glass and a round highlight in the corner */}
        <span
          aria-hidden='true'
          className='absolute inset-0 overflow-hidden rounded-[inherit]'
        >
          <span className='absolute inset-0 bg-linear-to-br from-ph-on-tile/30 via-transparent to-transparent' />
          <span className='absolute -top-20 -right-14 size-56 rounded-full bg-ph-on-tile/10' />
        </span>
        <div className='relative flex items-start justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-3'>
            <PaymentMark method={method} onFace />
            <div className='min-w-0'>
              <h3
                id={id}
                className='text-[20px]/[1.2] font-bold [overflow-wrap:anywhere]'
              >
                {method.name}
              </h3>
              <p className='mt-0.5 text-[12px]/[1.3] font-semibold tracking-[0.06em] uppercase'>
                {copy.kinds[method.kind]}
              </p>
            </div>
          </div>
          <PaymentContactless className='size-7 shrink-0' />
        </div>
        <PaymentChip className='relative h-8 w-11 shrink-0' />
        <PaymentFields method={method} face className='relative' />
      </div>
      <div className={cn(PAYMENT_ACTIONS, method.qr && PAYMENT_ACTIONS_QR)}>
        {method.qr && (
          <button
            type='button'
            onClick={onOpenQr}
            aria-label={copy.enlargeQr(method.name)}
            className='group relative size-[120px] cursor-zoom-in justify-self-center rounded-ph-inner bg-ph-paper p-2 ring-1 ring-ph-line @min-[360px]:justify-self-auto'
          >
            <Image
              src={method.qr}
              alt={copy.qrAlt(method.name)}
              width={240}
              height={240}
              unoptimized
              className='block size-full object-contain'
            />
            <span
              aria-hidden='true'
              className='absolute right-1.5 bottom-1.5 inline-flex h-6 items-center gap-1 rounded-full bg-ph-ink px-2 text-[12px] font-semibold text-ph-sheet transition-[scale] duration-100 group-active:scale-95'
            >
              <ZoomIn className='size-3.5' strokeWidth={2.4} />
              {copy.enlarge}
            </span>
          </button>
        )}
        <div className='flex min-w-0 flex-col gap-2'>
          <PhButton variant='solid' onClick={() => onCopy('account')}>
            <Copy aria-hidden='true' className='size-4' />
            {copy.copyNumber}
          </PhButton>
          <PhButton variant='tonal' onClick={() => onCopy('all')}>
            {copy.copyAll}
          </PhButton>
        </div>
      </div>
    </article>
  );
}
