/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from 'cn';

/** Account name and number as a definition list. A method with no account name shows the number only. */
export function PaymentFields({
  method,
  compact = false,
}: {
  method: Doc<'payments'>;
  /** the row layout: two columns, smaller number */
  compact?: boolean;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <dl
      className={cn(
        'm-0',
        compact
          ? 'grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-x-8 gap-y-1.5 max-[900px]:order-3 max-[900px]:col-span-full'
          : 'flex flex-col gap-2.5',
      )}
    >
      {method.holder && (
        <div className='flex min-w-0 flex-col gap-0.5'>
          <dt className='text-[13px] text-muted-foreground'>
            {copy.accountName}
          </dt>
          <dd className='m-0 text-base font-medium [overflow-wrap:anywhere]'>
            {method.holder}
          </dd>
        </div>
      )}
      <div className='flex min-w-0 flex-col gap-0.5'>
        <dt className='text-[13px] text-muted-foreground'>
          {copy.accountNumber}
        </dt>
        <dd
          className={cn(
            'm-0 font-bold tabular-nums [overflow-wrap:anywhere]',
            compact ? 'text-[17px]' : 'text-[22px]',
          )}
        >
          {method.account}
        </dd>
      </div>
    </dl>
  );
}
