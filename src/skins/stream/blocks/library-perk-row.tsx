/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Copy, QrCode } from 'lucide-react';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { LibraryMethodFields } from '@/skins/stream/blocks/library-method-fields';
import { LibraryMethodMark } from '@/skins/stream/blocks/library-method-mark';
import { StreamButton } from '@/skins/stream/ui/stream-button';

const tonalOnCard = 'bg-sm-hover2 hover:opacity-80';

/** A method of "More ways to pay" as a line of the perks list: badge, name, kind, the account, and the two actions. */
export function LibraryPerkRow({
  method,
  index,
  onCopy,
  onOpenQr,
}: {
  method: Doc<'payments'>;
  /** place in the list, for the staggered entrance */
  index: number;
  onCopy: () => void;
  onOpenQr: () => void;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <li
      data-testid='payment-method'
      style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
      className='flex animate-[sm-lib-rise_0.35s_cubic-bezier(0.2,0.7,0.2,1)_both] gap-3 rounded-xl bg-sm-surface p-4'
    >
      <LibraryMethodMark method={method} />
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
          <h3 className='text-base/[1.3] font-medium [overflow-wrap:anywhere]'>
            {method.name}
          </h3>
          <span className='inline-flex rounded-full bg-sm-hover2 px-2 py-px text-xs'>
            {copy.kinds[method.kind]}
          </span>
        </div>
        <LibraryMethodFields
          method={method}
          className='mt-2 flex-row flex-wrap gap-x-8 gap-y-2'
        />
        <div className='mt-3 flex flex-wrap items-center gap-2'>
          <StreamButton
            variant='tonal'
            onClick={onCopy}
            className={tonalOnCard}
          >
            <Copy aria-hidden='true' />
            {copy.copyNumber}
          </StreamButton>
          {method.qr && (
            <StreamButton
              variant='tonal'
              className={tonalOnCard}
              onClick={onOpenQr}
              aria-label={copy.showQr(method.name)}
            >
              <QrCode aria-hidden='true' />
              {copy.qrCode}
            </StreamButton>
          )}
        </div>
      </div>
    </li>
  );
}
