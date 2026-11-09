/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicPaymentCopy } from '@/content/copy/academic-payment';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentFields } from '@/skins/academic/blocks/payment-fields';
import { PaymentKind } from '@/skins/academic/blocks/payment-kind';
import { PaymentMark } from '@/skins/academic/blocks/payment-mark';
import { AcButton } from '@/skins/academic/ui/ac-button';

const TH =
  'ac-line relative py-2 pr-2.5 pb-2.5 text-left font-ac-note text-[18px] font-normal whitespace-nowrap [--ul:var(--ac-mute)] [--ac-line-y:0px] [--ac-line-h:6px] after:right-2.5 after:left-0';

/**
 * "More ways to pay": a ruled table, one method to a line (name and kind, account, the two actions). On a phone each line becomes a small
 * block and the header row is gone, so nothing is cut off.
 */
export function PaymentTable({
  methods,
  onCopy,
  onOpenQr,
}: {
  methods: Doc<'payments'>[];
  onCopy: (method: Doc<'payments'>) => void;
  onOpenQr: (method: Doc<'payments'>) => void;
}) {
  const copy = useCopy(paymentCopy);
  const words = useCopy(academicPaymentCopy);
  return (
    <table className='w-full border-collapse border-y-[2.5px] border-ac-ink/70 max-[760px]:block'>
      <caption className='pb-3 text-left caption-top text-[0.94em]/[1.45] text-ac-mute max-[760px]:block'>
        {words.caption}
      </caption>
      <thead className='max-[760px]:hidden'>
        <tr>
          <th scope='col' className={TH}>
            {words.columns.method}
          </th>
          <th scope='col' className={TH}>
            {words.columns.account}
          </th>
          <th scope='col' className={TH}>
            <span className='sr-only'>{words.columns.actions}</span>
          </th>
        </tr>
      </thead>
      <tbody className='max-[760px]:block'>
        {methods.map((method) => (
          <tr
            key={method.id}
            data-testid='payment-method'
            className='border-b-[1.5px] border-dashed border-ac-faint last:border-b-0 max-[760px]:grid max-[760px]:gap-y-2.5 max-[760px]:py-3.5'
          >
            <th
              scope='row'
              className='py-3 pr-3 text-left align-top font-normal max-[760px]:block max-[760px]:p-0'
            >
              <span className='flex items-center gap-3'>
                <PaymentMark method={method} />
                <span className='min-w-0'>
                  <span className='block font-semibold [overflow-wrap:anywhere]'>
                    {method.name}
                  </span>
                  <PaymentKind className='mt-0.5'>
                    {copy.kinds[method.kind]}
                  </PaymentKind>
                </span>
              </span>
            </th>
            <td className='py-3 pr-3 align-top max-[760px]:block max-[760px]:p-0'>
              <PaymentFields method={method} />
            </td>
            <td className='py-3 align-top max-[760px]:block max-[760px]:p-0'>
              <div className='flex flex-col items-start gap-2 max-[760px]:flex-row max-[760px]:flex-wrap'>
                <AcButton size='sm' onClick={() => onCopy(method)}>
                  {copy.copyNumber}
                </AcButton>
                {method.qr && (
                  <AcButton
                    variant='quiet'
                    size='sm'
                    aria-label={copy.showQr(method.name)}
                    onClick={() => onOpenQr(method)}
                  >
                    <span aria-hidden='true'>{copy.qrCode}</span>
                  </AcButton>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
