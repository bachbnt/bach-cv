/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Copy, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { MediaBadge } from '@/components/media-badge';
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
      className='flex items-center gap-6 rounded-3xl border bg-card p-5 max-[720px]:flex-col max-[720px]:items-stretch'
    >
      {method.qr && (
        <button
          type='button'
          onClick={onOpenQr}
          aria-label={copy.enlargeQr(method.name)}
          className='group/media relative flex w-[190px] flex-none cursor-zoom-in items-center justify-center rounded-xl bg-muted p-3 max-[720px]:w-full max-[720px]:max-w-[260px] max-[720px]:self-center'
        >
          <Image
            src={method.qr}
            alt={copy.qrAlt(method.name)}
            width={240}
            height={240}
            unoptimized
            className='block h-auto max-h-60 w-full rounded-md bg-white object-contain transition-transform duration-300 group-hover/media:scale-[1.03] motion-reduce:transition-none'
          />
          <MediaBadge
            icon={ZoomIn}
            className='right-2 bottom-2 px-2.5 py-1 text-xs'
          >
            {copy.enlarge}
          </MediaBadge>
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
            className='max-[720px]:flex-1'
          >
            <Copy aria-hidden='true' />
            {copy.copyNumber}
          </Button>
          <Button variant='link' size='link' onClick={() => onCopy('all')}>
            {copy.copyAll}
          </Button>
        </div>
      </div>
    </article>
  );
}
