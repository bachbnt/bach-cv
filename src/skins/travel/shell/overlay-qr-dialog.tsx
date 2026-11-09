/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Copy, CopyCheck, Download } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { copyToClipboard } from '@/components/payment/copy-to-clipboard';
import { summaryOf } from '@/components/payment/payment-details';
import { paymentCopy } from '@/content/copy/payment';
import { travelOverlaysCopy } from '@/content/copy/travel-overlays';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { TlNavTools } from '@/skins/travel/shell/overlay-nav-tools';
import { saveQr } from '@/skins/travel/shell/overlay-save-qr';
import { TlToolButton } from '@/skins/travel/shell/overlay-tool-button';
import { TlToolbar } from '@/skins/travel/shell/overlay-toolbar';
import { PICTURE_ZOOMS, zoomFromKey } from '@/skins/travel/shell/overlay-tools';
import { TlZoomStage } from '@/skins/travel/shell/overlay-zoom-stage';
import { TlZoomTools } from '@/skins/travel/shell/overlay-zoom-tools';
import { TlButton } from '@/skins/travel/ui/tl-button';
import { TlDialogShell } from '@/skins/travel/ui/tl-dialog-shell';

/**
 * The QR window of Payment, the scanner of the ticket counter: the same toolbar as the picture viewer (zoom, then Copy number, Copy all
 * details and Save QR, previous, counter and next at the right end), the QR on the table at the ratio it has, and under it the account
 * name and number as a ticket with its tear line. The arrow keys step through the methods that have a QR; `+`, `-` and `0` zoom. The
 * helpers and the messages are those of the Standard window. Same props as `PaymentQrDialog`.
 */
export function TlQrDialog({
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
  const { qr: words, viewer } = useCopy(travelOverlaysCopy);
  const [step, setStep] = useState(0);
  const [source, setSource] = useState(method.qr);
  // another method starts at the size that fits
  if (source !== method.qr) {
    setSource(method.qr);
    setStep(0);
  }
  const zoom = PICTURE_ZOOMS[step];
  const last = PICTURE_ZOOMS.length - 1;
  const copyAll = async () => {
    const done = await copyToClipboard(
      summaryOf(method, {
        accountName: copy.accountName,
        accountNumber: copy.accountNumber,
      }),
    );
    say(done ? copy.toast.allCopied(method.name) : copy.toast.copyFailed);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' && total > 1) onStep(-1);
    else if (event.key === 'ArrowRight' && total > 1) onStep(1);
    else {
      const next = zoomFromKey(event.key, step, last, 0);
      if (next !== null) setStep(next);
    }
  };

  return (
    <TlDialogShell
      open
      onOpenChange={(open) => !open && onClose()}
      title={copy.qrTitle(method.name)}
      kicker={words.kicker}
      description={words.details}
      closeLabel={copy.closeQr}
      size='lg'
      phone='full'
      onKeyDown={onKeyDown}
    >
      <TlToolbar
        label={viewer.tools}
        zoom={
          <TlZoomTools
            words={viewer}
            step={step}
            last={last}
            fit={0}
            percent={zoom * 100}
            onStep={setStep}
          />
        }
        actions={
          <>
            <TlButton variant='solid' size='sm' onClick={onCopy}>
              <Copy aria-hidden='true' />
              {copy.copyNumber}
            </TlButton>
            <TlToolButton label={copy.copyAll} onClick={() => void copyAll()}>
              <CopyCheck aria-hidden='true' />
            </TlToolButton>
            <TlButton
              variant='soft'
              size='sm'
              onClick={() => void saveQr(method, say, copy.toast)}
            >
              <Download aria-hidden='true' />
              {copy.saveQr}
            </TlButton>
          </>
        }
        end={
          total > 1 && (
            <TlNavTools
              prevLabel={copy.previousMethod}
              nextLabel={copy.nextMethod}
              counter={copy.counter(position, total)}
              onPrev={() => onStep(-1)}
              onNext={() => onStep(1)}
            />
          )
        }
      />
      {/* the picture is the bank card with its QR: it keeps the ratio it has and is as large as the window leaves room for */}
      <TlZoomStage
        image={{
          src: method.qr,
          alt: copy.qrAlt(method.name),
          width: 460,
          height: 600,
        }}
        zoom={zoom}
        testId='tl-qr-picture'
        fitClassName='max-[700px]:max-h-[calc(100dvh-420px)]'
      />
      <div className='tl-table flex-none border-t border-tl-line bg-tl-chip/50 px-4 py-3'>
        <dl className='tl-ticket-edge m-0 grid grid-cols-2 rounded-2xl bg-tl-solid px-5 py-2.5 [overflow-wrap:anywhere] max-[460px]:grid-cols-1 max-[460px]:gap-1.5'>
          {method.holder && (
            <div className='min-w-0 border-r border-dashed border-tl-line pr-3 max-[460px]:border-r-0 max-[460px]:pr-0'>
              <dt className='text-[11px] font-bold text-tl-muted'>
                {copy.accountName}
              </dt>
              <dd className='m-0 text-[14px] font-bold'>{method.holder}</dd>
            </div>
          )}
          <div
            className={cn(
              'min-w-0',
              method.holder
                ? 'pl-4 max-[460px]:pl-0'
                : 'col-span-2 max-[460px]:col-span-1',
            )}
          >
            <dt className='text-[11px] font-bold text-tl-muted'>
              {copy.accountNumber}
            </dt>
            <dd className='m-0 text-[17px] font-extrabold tracking-wide tabular-nums'>
              {method.account}
            </dd>
          </div>
        </dl>
      </div>
    </TlDialogShell>
  );
}
