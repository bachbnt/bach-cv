/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { COVER, COVER_IMAGE } from '@/skins/dev/blocks/cover-styles';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { DevBadge } from '@/skins/dev/ui/dev-badge';
import { DevButton } from '@/skins/dev/ui/dev-button';
import { DevKind } from '@/skins/dev/ui/dev-kind';
import { DevLinkButton } from '@/skins/dev/ui/dev-link';

/** A highlighted method: the QR code at the left (it opens the viewer), the details and the copy buttons at the right. */
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
  return (
    <article
      className='grid max-w-[760px] min-w-0 grid-cols-[230px_1fr] items-center gap-[22px] rounded-[8px] border border-line-2 bg-chrome p-4 transition-[border-color,transform] duration-200 ease-[ease] hover:border-signal hover:[transform:translateY(-3px)] max-[900px]:grid-cols-[1fr]'
      data-testid='payment-method'
      data-reveal
    >
      {method.qr && (
        <button
          type='button'
          data-slot='dev-cover'
          className={cn(
            COVER,
            'aspect-square rounded-[8px] border max-[620px]:w-full max-[620px]:max-w-[260px] max-[620px]:justify-self-center',
          )}
          aria-label={copy.enlargeQr(method.name)}
          onClick={onOpenQr}
        >
          <Image
            src={method.qr}
            alt=''
            fill
            sizes='230px'
            unoptimized
            className={cn(
              COVER_IMAGE,
              'bg-white object-contain object-center p-2',
            )}
          />
          <DevBadge aria-hidden='true'>
            <DevIcon name='zoom-in' /> {copy.enlarge}
          </DevBadge>
        </button>
      )}
      <div className='min-w-0'>
        <DevKind>{copy.kinds[method.kind]}</DevKind>
        <h3 className='text-[26px]'>{method.name}</h3>
        <dl className='mt-2.5 grid grid-cols-[auto_1fr] gap-x-[18px] gap-y-1 font-code'>
          {method.holder && (
            <>
              <dt className='text-[12.5px] text-dim'>{copy.accountName}</dt>
              <dd className='text-head wrap-anywhere'>{method.holder}</dd>
            </>
          )}
          <dt className='text-[12.5px] text-dim'>{copy.accountNumber}</dt>
          <dd className='text-[22px] font-bold tracking-[0.04em] text-signal wrap-anywhere'>
            {method.account}
          </dd>
        </dl>
        <div className='mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 max-[620px]:[&_[data-slot=dev-button]]:flex-1 max-[620px]:[&_[data-slot=dev-button]]:justify-center'>
          <DevButton
            variant='solid'
            size='sm'
            className='active:[transform:scale(0.97)]'
            onClick={() => onCopy('account')}
          >
            <DevIcon name='copy' />
            {copy.copyNumber}
          </DevButton>
          <DevLinkButton onClick={() => onCopy('all')}>
            {copy.copyAll}
          </DevLinkButton>
        </div>
      </div>
    </article>
  );
}
