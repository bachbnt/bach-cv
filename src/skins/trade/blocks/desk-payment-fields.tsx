/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';
import { cn } from '@/lib/utils';

/** The account name and the account number as a definition list; a method with no account name shows the number only. */
export function DeskPaymentFields({
  method,
  labels,
  className,
  numberClassName,
}: {
  method: Doc<'payments'>;
  labels: { accountName: string; accountNumber: string };
  className?: string;
  numberClassName?: string;
}) {
  return (
    <dl className={cn('m-0 flex flex-col gap-2', className)}>
      {method.holder && (
        <div className='min-w-0'>
          <dt className='text-[11px] text-tv-mute'>{labels.accountName}</dt>
          <dd className='m-0 text-[13px] font-medium [overflow-wrap:anywhere]'>
            {method.holder}
          </dd>
        </div>
      )}
      <div className='min-w-0'>
        <dt className='text-[11px] text-tv-mute'>{labels.accountNumber}</dt>
        <dd
          className={cn(
            'm-0 font-bold tabular-nums [overflow-wrap:anywhere]',
            numberClassName,
          )}
        >
          {method.account}
        </dd>
      </div>
    </dl>
  );
}
