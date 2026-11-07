/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';

export type PaymentKind = Doc<'payments'>['kind'];
export type PaymentFilterValue = 'all' | PaymentKind;

/** "All / Bank / Wallet", each with how many methods it holds. Only kinds that exist are offered. */
export function PaymentFilter({
  rest,
  value,
  onChange,
}: {
  rest: Doc<'payments'>[];
  value: PaymentFilterValue;
  onChange: (value: PaymentFilterValue) => void;
}) {
  const copy = useCopy(paymentCopy);
  const kinds = (['bank', 'wallet'] as const).filter((k) =>
    rest.some((m) => m.kind === k),
  );
  if (kinds.length < 2) return null;
  return (
    <div
      role='group'
      aria-label={copy.filterLabel}
      className='mb-4 flex flex-wrap items-center gap-2'
    >
      {(['all', ...kinds] as const).map((k) => (
        <button
          key={k}
          type='button'
          aria-pressed={value === k}
          onClick={() => onChange(k)}
          className='min-h-9 cursor-pointer border border-mb-line bg-mb-well px-3.5 py-1.5 text-[13.5px] font-bold text-mb-ink transition-colors hover:border-mb-gold hover:text-mb-gold-ink aria-pressed:border-mb-gold aria-pressed:bg-mb-gold/25 aria-pressed:text-mb-gold-ink pointer-coarse:min-h-11'
        >
          {k === 'all' ? copy.filterAll : copy.kinds[k]}
          <span className='ml-1.5 tabular-nums opacity-70'>
            {k === 'all'
              ? rest.length
              : rest.filter((m) => m.kind === k).length}
          </span>
        </button>
      ))}
    </div>
  );
}
