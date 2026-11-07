/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Copy, QrCode } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { PaymentFields } from '@/skins/travel/blocks/payment-fields';
import { PaymentStubButton } from '@/skins/travel/blocks/payment-stub-button';
import { paymentCopy } from '@/content/copy/payment';
import { methodInitials } from '@/lib/derive/initials';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';

/** A method of "More ways to pay" as a smaller ticket: the logo (or its initials), the name and kind, the account, and the stub with Copy number and the QR code. */
export function PaymentTicketRow({
  method,
  color,
  onCopy,
  onOpenQr,
}: {
  method: Doc<'payments'>;
  /** 1 to 6, the stop colour of the ticket */
  color: number;
  onCopy: () => void;
  onOpenQr: () => void;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <li
      data-testid='payment-method'
      style={{ '--tl-pc': `var(--tl-stop-${color})` } as CSSProperties}
      className='tl-ticket flex drop-shadow-[0_8px_10px_color-mix(in_srgb,var(--tl-ink)_13%,transparent)]'
    >
      <div className='tl-notch-r flex min-w-0 flex-1 items-start gap-3 rounded-l-2xl border border-r-0 border-l-[6px] border-tl-line border-l-(--tl-pc) bg-[color-mix(in_srgb,var(--tl-chip)_38%,var(--tl-solid))] py-3 pr-3 pl-3'>
        {method.logo ? (
          <Image
            src={method.logo}
            alt=''
            width={40}
            height={40}
            unoptimized
            className='size-10 flex-none rounded-xl bg-white object-cover ring-1 ring-tl-line'
          />
        ) : (
          <span
            aria-hidden='true'
            className='grid size-10 flex-none place-items-center rounded-xl bg-tl-chip text-[13px] font-extrabold text-tl-chip-ink'
          >
            {methodInitials(method.name)}
          </span>
        )}
        <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
          <div className='min-w-0'>
            <h3 className='text-[16px]/[1.2] font-extrabold [overflow-wrap:anywhere]'>
              {method.name}
            </h3>
            <p className='m-0 text-[11px] font-extrabold tracking-[1px] text-tl-muted uppercase'>
              {copy.kinds[method.kind]}
            </p>
          </div>
          <PaymentFields
            method={method}
            labels={copy}
            numberClassName='text-[16px]/[1.2]'
          />
        </div>
      </div>
      <div className='tl-notch-l flex w-[104px] flex-none flex-col items-stretch justify-center gap-2 rounded-r-2xl border border-l-2 border-dashed border-tl-line bg-[color-mix(in_srgb,var(--tl-pc)_16%,color-mix(in_srgb,var(--tl-chip)_38%,var(--tl-solid)))] p-2'>
        <PaymentStubButton primary onClick={onCopy}>
          <Copy aria-hidden='true' />
          {copy.copyNumber}
        </PaymentStubButton>
        {method.qr && (
          <PaymentStubButton
            onClick={onOpenQr}
            aria-label={copy.showQr(method.name)}
          >
            <QrCode aria-hidden='true' />
            {copy.qrCode}
          </PaymentStubButton>
        )}
      </div>
    </li>
  );
}
