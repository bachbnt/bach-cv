/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { paymentCopy } from '@/content/copy/payment';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DeskPaymentFields } from '@/skins/trade/blocks/desk-payment-fields';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvChip } from '@/skins/trade/ui/tv-chip';
import { TvCopyIcon } from '@/skins/trade/ui/tv-copy-icon';
import { useCopyFeedback } from '@/skins/trade/ui/use-copy-feedback';

/**
 * A highlighted method as the recommended one: the QR code as a thumbnail that opens the Standard QR window, the kind, the account details and
 * the two copy actions.
 */
export function DeskPaymentRecommended({
  method,
  onCopy,
  onOpenQr,
}: {
  method: Doc<'payments'>;
  onCopy: (kind: 'account' | 'all') => void;
  onOpenQr: () => void;
}) {
  const copy = useCopy(paymentCopy);
  const desk = useCopy(tradeDeskCopy).payment;
  const account = useCopyFeedback();
  return (
    <article
      data-testid='payment-method'
      className={cn(
        'grid items-center gap-3 rounded border border-tv-line border-l-2 border-l-tv-up bg-tv-bg p-3',
        method.qr && '@[480px]:grid-cols-[132px_minmax(0,1fr)]',
      )}
    >
      {method.qr && (
        <button
          type='button'
          onClick={onOpenQr}
          aria-label={copy.enlargeQr(method.name)}
          className='group/qr relative mx-auto block w-[132px] cursor-zoom-in overflow-hidden rounded border border-tv-line bg-white p-1.5 @[480px]:mx-0'
        >
          <Image
            src={method.qr}
            alt={copy.qrAlt(method.name)}
            width={240}
            height={240}
            unoptimized
            className='block h-auto w-full object-contain transition-transform duration-300 ease-tv-out group-hover/qr:scale-105'
          />
          <span className='absolute right-1 bottom-1 inline-flex items-center gap-1 rounded bg-tv-tip px-1.5 py-0.5 text-[10px] font-medium text-white'>
            <ZoomIn aria-hidden='true' className='size-3' />
            {copy.enlarge}
          </span>
        </button>
      )}
      <div className='flex min-w-0 flex-col gap-2'>
        <div className='flex flex-wrap items-center gap-1.5'>
          <TvChip tone='up'>{desk.recommended}</TvChip>
          <TvChip>{copy.kinds[method.kind]}</TvChip>
        </div>
        <h3 className='text-lg/tight font-bold'>{method.name}</h3>
        <DeskPaymentFields
          method={method}
          labels={copy}
          numberClassName='text-xl'
        />
        <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5'>
          <TvButton
            variant='primary'
            onClick={() => {
              account.arm();
              onCopy('account');
            }}
          >
            <TvCopyIcon copied={account.copied} />
            {copy.copyNumber}
          </TvButton>
          <TvButton variant='ghost' onClick={() => onCopy('all')}>
            {copy.copyAll}
          </TvButton>
        </div>
      </div>
    </article>
  );
}
