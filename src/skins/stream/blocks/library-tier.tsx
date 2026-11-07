/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Copy, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { LibraryMethodFields } from '@/skins/stream/blocks/library-method-fields';
import { LibraryMethodMark } from '@/skins/stream/blocks/library-method-mark';
import { StreamButton } from '@/skins/stream/ui/stream-button';

/**
 * A featured method as the main membership level: a coloured band with its badge, name and kind, the account number as the price,
 * the account name, the QR code (it opens Standard's viewer) and the two copy actions.
 */
export function LibraryTier({
  method,
  onCopy,
  onOpenQr,
}: {
  method: Doc<'payments'>;
  onCopy: (kind: 'account' | 'all') => void;
  onOpenQr: () => void;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <article
      data-testid='payment-method'
      className='overflow-hidden rounded-2xl bg-sm-surface'
    >
      <div className='sm-lib-band flex items-center gap-3 px-5 py-4'>
        <LibraryMethodMark method={method} className='size-12' />
        <div className='min-w-0'>
          <h3 className='text-xl/[1.2] font-bold [overflow-wrap:anywhere]'>
            {method.name}
          </h3>
          <span className='mt-1 inline-flex rounded-full bg-sm-bg/60 px-2.5 py-0.5 text-xs font-medium'>
            {copy.kinds[method.kind]}
          </span>
        </div>
      </div>
      <div className='flex items-start gap-4 px-5 pt-5'>
        <LibraryMethodFields method={method} price className='flex-1' />
        {method.qr && (
          <button
            type='button'
            onClick={onOpenQr}
            aria-label={copy.enlargeQr(method.name)}
            className='group/qr relative size-[116px] flex-none cursor-zoom-in overflow-hidden rounded-lg bg-white p-1.5'
          >
            <Image
              src={method.qr}
              alt={copy.qrAlt(method.name)}
              width={240}
              height={240}
              unoptimized
              className='size-full object-contain transition-transform duration-300 group-hover/qr:scale-[1.05]'
            />
            <span
              aria-hidden='true'
              className='pointer-events-none absolute right-1 bottom-1 inline-flex items-center gap-1 rounded-sm bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white'
            >
              <ZoomIn className='size-3.5' />
              {copy.enlarge}
            </span>
          </button>
        )}
      </div>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-1 p-5'>
        <StreamButton
          variant='blue'
          onClick={() => onCopy('account')}
          className='max-[480px]:w-full'
        >
          <Copy aria-hidden='true' />
          {copy.copyNumber}
        </StreamButton>
        <button
          type='button'
          onClick={() => onCopy('all')}
          className='cursor-pointer text-sm font-medium text-sm-blue hover:underline max-[480px]:min-h-11 pointer-coarse:min-h-11'
        >
          {copy.copyAll}
        </button>
      </div>
    </article>
  );
}
