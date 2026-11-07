/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/** Account name and number as a definition list. A method with no account name shows the number only. */
export function PaymentFields({
  method,
  large = false,
  compact = false,
  className,
}: {
  method: Doc<'payments'>;
  large?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <dl
      className={cn(
        'm-0 min-w-0',
        compact
          ? 'grid grid-cols-1 gap-2.5 @[22rem]/purse:grid-cols-2 @[22rem]/purse:gap-x-6'
          : 'flex flex-col gap-2.5',
        className,
      )}
    >
      {method.holder && (
        <div className='flex min-w-0 flex-col gap-0.5'>
          <dt className='text-[11px] font-bold tracking-[0.16em] text-mb-mute uppercase'>
            {copy.accountName}
          </dt>
          <dd className='m-0 text-[15.5px] font-semibold text-mb-ink [overflow-wrap:anywhere]'>
            {method.holder}
          </dd>
        </div>
      )}
      <div className='flex min-w-0 flex-col gap-0.5'>
        <dt className='text-[11px] font-bold tracking-[0.16em] text-mb-mute uppercase'>
          {copy.accountNumber}
        </dt>
        <dd
          className={cn(
            'm-0 font-bold text-mb-gold-ink tabular-nums [overflow-wrap:anywhere]',
            large ? 'text-[24px]' : 'text-[18px]',
          )}
        >
          {method.account}
        </dd>
      </div>
    </dl>
  );
}
