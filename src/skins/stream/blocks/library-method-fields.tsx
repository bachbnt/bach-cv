/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/**
 * The account of a method, as a definition list with Standard's labels. `price` sets the number as large as the price of a
 * membership level; a method with no account name shows the number only.
 */
export function LibraryMethodFields({
  method,
  price = false,
  className,
}: {
  method: Doc<'payments'>;
  price?: boolean;
  className?: string;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <dl className={cn('m-0 flex min-w-0 flex-col gap-3', className)}>
      <div className='min-w-0'>
        <dt className='text-xs text-sm-mute'>{copy.accountNumber}</dt>
        <dd
          className={cn(
            'm-0 font-bold tracking-tight tabular-nums [overflow-wrap:anywhere]',
            price ? 'text-[28px]/[1.2]' : 'text-lg/[1.3]',
          )}
        >
          {method.account}
        </dd>
      </div>
      {method.holder && (
        <div className='min-w-0'>
          <dt className='text-xs text-sm-mute'>{copy.accountName}</dt>
          <dd className='m-0 text-sm font-medium [overflow-wrap:anywhere]'>
            {method.holder}
          </dd>
        </div>
      )}
    </dl>
  );
}
