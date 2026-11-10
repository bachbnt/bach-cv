/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { CopyCheck, Download } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import { copyToClipboard } from '@/components/payment/copy-to-clipboard';
import { summaryOf } from '@/components/payment/payment-details';
import { saveQr } from '@/components/payment/save-qr';
import { tradeOverlayCopy } from '@/content/copy/trade-overlay';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { TvDialogShell } from '@/skins/trade/shell/overlay-dialog-shell';
import { TvNavTools } from '@/skins/trade/shell/overlay-nav-tools';
import { TvToolButton } from '@/skins/trade/shell/overlay-tool-button';
import { TvToolbar } from '@/skins/trade/shell/overlay-toolbar';
import { PICTURE_ZOOMS, zoomFromKey } from '@/skins/trade/shell/overlay-tools';
import { TvZoomStage } from '@/skins/trade/shell/overlay-zoom-stage';
import { TvZoomTools } from '@/skins/trade/shell/overlay-zoom-tools';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvCopyIcon } from '@/skins/trade/ui/tv-copy-icon';
import { useCopyFeedback } from '@/skins/trade/ui/use-copy-feedback';

/**
 * The QR window of Payment, in the family of the picture viewer: the same toolbar (zoom, then Copy number, Copy all details and Save QR,
 * and previous, counter and next at the right end), the same stage with the picture at the ratio it has, and under it the account
 * name and number. The arrow keys step through the methods that have a QR; `+`, `-` and `0` zoom. The helpers and the messages are
 * those of the Standard window.
 */
export function TvQrDialog({
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
  const { qr: words, viewer } = useCopy(tradeOverlayCopy);
  const [step, setStep] = useState(0);
  const [source, setSource] = useState(method.qr);
  // another method starts at the size that fits
  if (source !== method.qr) {
    setSource(method.qr);
    setStep(0);
  }
  const zoom = PICTURE_ZOOMS[step];
  const last = PICTURE_ZOOMS.length - 1;
  const number = useCopyFeedback();
  const details = useCopyFeedback();
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
    <TvDialogShell
      open
      onOpenChange={(open) => !open && onClose()}
      title={copy.qrTitle(method.name)}
      description={words.details}
      closeLabel={copy.closeQr}
      size='lg'
      phone='full'
      onKeyDown={onKeyDown}
    >
      <TvToolbar
        label={viewer.tools}
        zoom={
          <TvZoomTools
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
            <TvButton
              variant='primary'
              onClick={() => {
                number.arm();
                onCopy();
              }}
            >
              <TvCopyIcon copied={number.copied} />
              {copy.copyNumber}
            </TvButton>
            <TvToolButton
              label={copy.copyAll}
              onClick={() => {
                details.arm();
                void copyAll();
              }}
            >
              <TvCopyIcon
                copied={details.copied}
                icon={CopyCheck}
                className='size-4'
              />
            </TvToolButton>
            <TvToolButton
              label={copy.saveQr}
              onClick={() => void saveQr(method, say, copy.toast)}
            >
              <Download aria-hidden='true' className='size-4' />
            </TvToolButton>
          </>
        }
        end={
          total > 1 && (
            <TvNavTools
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
      <TvZoomStage
        image={{
          src: method.qr,
          alt: copy.qrAlt(method.name),
          width: 460,
          height: 600,
        }}
        zoom={zoom}
        testId='tv-qr-picture'
        fitClassName='max-[700px]:max-h-[calc(100dvh-340px)]'
      />
      <dl className='grid flex-none grid-cols-2 gap-2 border-t border-tv-line p-3 [overflow-wrap:anywhere] max-[460px]:grid-cols-1'>
        {method.holder && (
          <div className='rounded border border-tv-line px-3 py-1.5'>
            <dt className='text-[11px] text-tv-mute'>{copy.accountName}</dt>
            <dd className='text-[13px] font-semibold'>{method.holder}</dd>
          </div>
        )}
        <div
          className={cn(
            'rounded border border-tv-line px-3 py-1.5',
            !method.holder && 'col-span-2 max-[460px]:col-span-1',
          )}
        >
          <dt className='text-[11px] text-tv-mute'>{copy.accountNumber}</dt>
          <dd className='text-[15px] font-semibold tracking-wide tabular-nums'>
            {method.account}
          </dd>
        </div>
      </dl>
    </TvDialogShell>
  );
}
