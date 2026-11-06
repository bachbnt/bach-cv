/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { QrCode } from 'lucide-react';
import Image from 'next/image';
import { initialsOf } from '@/components/payment/payment-details';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { DevButton } from '@/skins/dev/ui/dev-button';
import { DevKind } from '@/skins/dev/ui/dev-kind';

const LABEL =
  'block font-code text-[12px] leading-[normal] font-normal text-dim';
const VALUE = 'font-code font-medium text-head wrap-anywhere';

/** A method in "More ways to pay": its name and logo, the account fields and the two actions on one line. */
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
      className='grid grid-cols-[1fr] items-center gap-[18px] rounded-[8px] border border-line-2 bg-chrome px-5 py-3.5 transition-[border-color,transform] duration-200 ease-[ease] *:min-w-0 hover:border-signal hover:[transform:translateY(-3px)] min-[621px]:grid-cols-[1fr_1fr] min-[901px]:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]'
      data-testid='payment-method'
      data-reveal
    >
      <div className='flex items-center gap-3'>
        <span
          className='grid size-11 flex-none place-items-center overflow-hidden rounded-[10px] bg-chrome-2 font-code text-[14px] leading-[normal] font-bold text-head'
          aria-hidden='true'
        >
          {method.logo ? (
            <Image
              src={method.logo}
              alt=''
              width={44}
              height={44}
              unoptimized
              className='size-full bg-white object-cover'
            />
          ) : (
            initialsOf(method.name)
          )}
        </span>
        <div>
          <h3 className='text-[18px] wrap-anywhere'>{method.name}</h3>
          <DevKind className='mt-1 mb-0'>{copy.kinds[method.kind]}</DevKind>
        </div>
      </div>
      <div>
        {method.holder && (
          <>
            <span className={LABEL}>{copy.accountName}</span>
            <b className={VALUE}>{method.holder}</b>
          </>
        )}
      </div>
      <div>
        <span className={LABEL}>{copy.accountNumber}</span>
        <b
          className={cn(
            VALUE,
            'text-[16px] font-bold tracking-[0.04em] text-signal',
          )}
        >
          {method.account}
        </b>
      </div>
      <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 max-[900px]:col-[1/-1] max-[620px]:[&_[data-slot=dev-button]]:flex-1 max-[620px]:[&_[data-slot=dev-button]]:justify-center'>
        <DevButton
          variant='solid'
          size='sm'
          className='active:[transform:scale(0.97)]'
          onClick={onCopy}
        >
          <DevIcon name='copy' />
          {copy.copyNumber}
        </DevButton>
        {method.qr && (
          <DevButton
            size='sm'
            className='active:[transform:scale(0.97)]'
            aria-label={copy.showQr(method.name)}
            onClick={onOpenQr}
          >
            <QrCode aria-hidden='true' className='size-[15px]' />
            <span aria-hidden='true'>{copy.qrCode}</span>
          </DevButton>
        )}
      </div>
    </li>
  );
}
