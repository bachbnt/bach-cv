/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';
import { cn } from '@/lib/utils';

/** The account name and the account number as a definition list; a method with no account name shows the number only. */
export function PaymentFields({
  method,
  labels,
  numberClassName,
}: {
  method: Doc<'payments'>;
  labels: { accountName: string; accountNumber: string };
  numberClassName?: string;
}) {
  return (
    <dl className='m-0 flex flex-col gap-1.5'>
      {method.holder && (
        <div className='min-w-0'>
          <dt className='text-[11.5px] font-bold text-tl-muted'>
            {labels.accountName}
          </dt>
          <dd className='m-0 text-[14px] font-semibold [overflow-wrap:anywhere]'>
            {method.holder}
          </dd>
        </div>
      )}
      <div className='min-w-0'>
        <dt className='text-[11.5px] font-bold text-tl-muted'>
          {labels.accountNumber}
        </dt>
        <dd
          className={cn(
            'm-0 font-extrabold tracking-wide tabular-nums [overflow-wrap:anywhere]',
            numberClassName,
          )}
        >
          {method.account}
        </dd>
      </div>
    </dl>
  );
}
