/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/** Account name and number as a definition list: the number is written in the pen of the page. A method with no account name shows the number only. */
export function PaymentFields({
  method,
  className,
}: {
  method: Doc<'payments'>;
  className?: string;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <dl className={cn('m-0 grid gap-1', className)}>
      {method.holder && (
        <div className='min-w-0'>
          <dt className='font-ac-note text-[14.5px] leading-tight text-ac-mute'>
            {copy.accountName}
          </dt>
          <dd className='m-0 font-medium [overflow-wrap:anywhere]'>
            {method.holder}
          </dd>
        </div>
      )}
      <div className='min-w-0'>
        <dt className='font-ac-note text-[14.5px] leading-tight text-ac-mute'>
          {copy.accountNumber}
        </dt>
        <dd className='m-0 font-ac-hand text-[27px]/[1.15] font-bold tracking-[0.04em] text-ac-accent [overflow-wrap:anywhere]'>
          {method.account}
        </dd>
      </div>
    </dl>
  );
}
