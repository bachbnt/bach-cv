/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Copy, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { PaymentFields } from '@/skins/travel/blocks/payment-fields';
import { PaymentStubButton } from '@/skins/travel/blocks/payment-stub-button';
import { paymentCopy } from '@/content/copy/payment';
import { travelDeskCopy } from '@/content/copy/travel-desk';
import { fill } from '@/lib/chat/fill';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import type { CSSProperties } from 'react';

/**
 * A highlighted method as the ticket of a window of the counter: the main part with the window and the kind, the name, the account
 * and "Copy all details"; the stub on its right, past the tear line, with the QR code (it opens the scanner, the QR window) and Copy
 * number. The colour of the window is one of the stop colours of the trip, by its place.
 */
export function PaymentTicket({
  method,
  window: windowNumber,
  color,
  onCopy,
  onOpenQr,
}: {
  method: Doc<'payments'>;
  /** the number of the window (its place among the highlighted methods, from 1) */
  window: number;
  /** 1 to 6, the stop colour of the ticket */
  color: number;
  onCopy: (kind: 'account' | 'all') => void;
  onOpenQr: () => void;
}) {
  const copy = useCopy(paymentCopy);
  const desk = useCopy(travelDeskCopy).payment;
  return (
    <article
      data-testid='payment-method'
      style={{ '--tl-pc': `var(--tl-stop-${color})` } as CSSProperties}
      className='tl-ticket flex drop-shadow-[0_10px_14px_color-mix(in_srgb,var(--tl-ink)_16%,transparent)]'
    >
      <div className='tl-notch-r flex min-w-0 flex-1 flex-col gap-2 rounded-l-3xl border border-r-0 border-l-[7px] border-tl-line border-l-(--tl-pc) bg-[color-mix(in_srgb,var(--tl-chip)_38%,var(--tl-solid))] py-3.5 pr-3.5 pl-3.5'>
        <p className='m-0 text-[11px] font-extrabold tracking-[1px] text-tl-muted uppercase'>
          <span className='text-tl-ink'>
            {fill(desk.window, { n: windowNumber })}
          </span>
          <span aria-hidden='true'> · </span>
          {copy.kinds[method.kind]}
        </p>
        <h3 className='text-[20px]/[1.15] font-extrabold [overflow-wrap:anywhere]'>
          {method.name}
        </h3>
        <PaymentFields
          method={method}
          labels={copy}
          numberClassName='text-[20px]/[1.2]'
        />
        <button
          type='button'
          onClick={() => onCopy('all')}
          className='-ml-1 mt-auto min-h-8 cursor-pointer self-start rounded-lg px-1 text-left text-[13px] font-bold text-tl-chip-ink underline underline-offset-[3px] pointer-coarse:min-h-11'
        >
          {copy.copyAll}
        </button>
      </div>
      <div className='tl-notch-l flex w-[112px] flex-none flex-col items-stretch justify-center gap-2 rounded-r-3xl border border-l-2 border-dashed border-tl-line bg-[color-mix(in_srgb,var(--tl-pc)_16%,color-mix(in_srgb,var(--tl-chip)_38%,var(--tl-solid)))] p-2.5'>
        {method.qr && (
          <button
            type='button'
            onClick={onOpenQr}
            aria-label={copy.enlargeQr(method.name)}
            className='group/qr relative block w-full cursor-zoom-in overflow-hidden rounded-xl bg-white p-1.5 shadow-tl-card transition-transform hover:-translate-y-px active:scale-95'
          >
            <Image
              src={method.qr}
              alt={copy.qrAlt(method.name)}
              width={240}
              height={240}
              unoptimized
              className='block h-auto w-full object-contain'
            />
            <span className='absolute right-1 bottom-1 grid size-6 place-items-center rounded-full bg-tl-ink text-tl-solid'>
              <ZoomIn aria-hidden='true' className='size-3.5' />
            </span>
          </button>
        )}
        <PaymentStubButton primary onClick={() => onCopy('account')}>
          <Copy aria-hidden='true' />
          {copy.copyNumber}
        </PaymentStubButton>
      </div>
    </article>
  );
}
