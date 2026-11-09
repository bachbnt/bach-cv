/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Copy, Download } from 'lucide-react';
import { saveQr } from '@/components/payment/save-qr';
import { Lightbox } from '@/components/lightbox/lightbox';
import { Button } from '@/components/ui/button';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';

/** The QR zoom dialog: the QR on a white card, the account details, copy and save, and prev/next across methods. */
export function PaymentQrDialog({
  method,
  position,
  total,
  onStep,
  onClose,
  onCopy,
  say,
}: {
  method: Doc<'payments'>;
  /** 1-based place of this method among those that have a QR */
  position: number;
  total: number;
  onStep: (by: number) => void;
  onClose: () => void;
  onCopy: () => void;
  say: (message: string) => void;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <Lightbox
      open
      onOpenChange={(open) => !open && onClose()}
      title={copy.qrTitle(method.name)}
      image={{
        src: method.qr,
        alt: copy.qrAlt(method.name),
        width: 460,
        height: 460,
      }}
      imageClassName='max-w-[min(100%,460px)] p-4'
      closeLabel={copy.closeQr}
      meta={
        <div className='flex flex-col gap-0.5 [overflow-wrap:anywhere]'>
          {method.holder && (
            <p>
              {copy.accountName}:{' '}
              <b className='font-semibold text-foreground'>{method.holder}</b>
            </p>
          )}
          <p>
            {copy.accountNumber}:{' '}
            <b className='font-semibold text-foreground'>{method.account}</b>
          </p>
        </div>
      }
      actions={
        <>
          <Button onClick={onCopy}>
            <Copy aria-hidden='true' />
            {copy.copyNumber}
          </Button>
          <Button
            variant='outline'
            onClick={() => void saveQr(method, say, copy.toast)}
          >
            <Download aria-hidden='true' />
            {copy.saveQr}
          </Button>
        </>
      }
      nav={
        total > 1
          ? {
              onPrev: () => onStep(-1),
              onNext: () => onStep(1),
              prevLabel: copy.previousMethod,
              nextLabel: copy.nextMethod,
              counter: copy.counter(position, total),
            }
          : undefined
      }
    />
  );
}
