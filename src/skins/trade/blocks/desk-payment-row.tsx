/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Copy, QrCode } from 'lucide-react';
import Image from 'next/image';
import { methodInitials } from '@/lib/derive/initials';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvChip } from '@/skins/trade/ui/tv-chip';

/** The columns of the deposit table; the header row and every row share it. */
export const PAYMENT_COLUMNS =
  '@[760px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_240px]';

/** One method of the deposit table: the method with its kind, the account name and number, and the copy and QR actions. */
export function DeskPaymentRow({
  method,
  onCopy,
  onOpenQr,
}: {
  method: Doc<'payments'>;
  onCopy: () => void;
  onOpenQr: () => void;
}) {
  const copy = useCopy(paymentCopy);
  const label = '@[760px]:sr-only text-[11px] text-tv-mute';
  return (
    <li
      data-testid='payment-method'
      className={cn(
        'grid items-center gap-x-4 gap-y-2 border-b border-tv-line px-3 py-2.5 last:border-b-0 hover:bg-tv-hover/50',
        PAYMENT_COLUMNS,
      )}
    >
      <div className='flex min-w-0 items-center gap-2.5'>
        {method.logo ? (
          <Image
            src={method.logo}
            alt=''
            width={32}
            height={32}
            unoptimized
            className='size-8 flex-none rounded bg-white object-cover ring-1 ring-tv-line'
          />
        ) : (
          <span
            aria-hidden='true'
            className='grid size-8 flex-none place-items-center rounded bg-tv-hover text-[11px] font-bold'
          >
            {methodInitials(method.name)}
          </span>
        )}
        <div className='min-w-0'>
          <h3 className='text-[13px]/tight font-semibold'>{method.name}</h3>
          <TvChip className='mt-0.5'>{copy.kinds[method.kind]}</TvChip>
        </div>
      </div>
      {method.holder ? (
        <dl className='m-0 min-w-0'>
          <dt className={label}>{copy.accountName}</dt>
          <dd className='m-0 text-[13px] [overflow-wrap:anywhere]'>
            {method.holder}
          </dd>
        </dl>
      ) : (
        <span aria-hidden='true' className='hidden @[760px]:block' />
      )}
      <dl className='m-0 min-w-0'>
        <dt className={label}>{copy.accountNumber}</dt>
        <dd className='m-0 text-sm font-bold tabular-nums [overflow-wrap:anywhere]'>
          {method.account}
        </dd>
      </dl>
      <div className='flex flex-wrap items-center gap-1.5'>
        <TvButton variant='outline' onClick={onCopy}>
          <Copy aria-hidden='true' />
          {copy.copyNumber}
        </TvButton>
        {method.qr && (
          <TvButton
            variant='outline'
            onClick={onOpenQr}
            aria-label={copy.showQr(method.name)}
          >
            <QrCode aria-hidden='true' />
            {copy.qrCode}
          </TvButton>
        )}
      </div>
    </li>
  );
}
