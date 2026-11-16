/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/**
 * Account name and number as a definition list. A method with no account name shows the number only. `face` is the list on the coloured
 * face of a featured method (light ink, the number large); otherwise it is a row of the list (two columns on a tablet).
 */
export function PaymentFields({
  method,
  face = false,
  className,
}: {
  method: Doc<'payments'>;
  face?: boolean;
  className?: string;
}) {
  const copy = useCopy(paymentCopy);
  const label = cn('text-[13px]/[1.3] font-medium', !face && 'text-ph-mute');
  return (
    <dl
      className={cn(
        'm-0 grid gap-2',
        // on a card the number comes above the name, as on a bank card; the list keeps its order for readers
        face && 'flex flex-col-reverse gap-3',
        !face &&
          '@min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @min-[900px]:gap-x-6',
        className,
      )}
    >
      {method.holder && (
        <div className='min-w-0'>
          <dt className={label}>{copy.accountName}</dt>
          <dd
            className={cn(
              'm-0 font-semibold [overflow-wrap:anywhere]',
              face ? 'text-[15px]/[1.35] uppercase' : 'text-[16px]/[1.4]',
            )}
          >
            {method.holder}
          </dd>
        </div>
      )}
      <div className='min-w-0'>
        <dt className={label}>{copy.accountNumber}</dt>
        <dd
          className={cn(
            'm-0 font-bold tracking-[0.04em] tabular-nums [overflow-wrap:anywhere]',
            face ? 'text-[24px]/[1.2] tracking-[0.08em]' : 'text-[17px]/[1.4]',
          )}
        >
          {method.account}
        </dd>
      </div>
    </dl>
  );
}
