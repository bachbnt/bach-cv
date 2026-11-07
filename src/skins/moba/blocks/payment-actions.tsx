/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Copy, Download } from 'lucide-react';
import { copyToClipboard } from '@/components/payment/copy-to-clipboard';
import { summaryOf } from '@/components/payment/payment-details';
import { saveQr } from '@/components/payment/payment-qr-dialog';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { MbButton } from '@/skins/moba/ui/mb-button';
import {
  useOverlays,
  type ViewerItem,
} from '@/skins/moba/shell/overlay-context';

type Method = Doc<'payments'>;

/**
 * What a method can do: copy its number, copy all its details, and open the QR viewer on the methods that have a QR code (in the order of
 * the page). The words of the toast and of the viewer are the Standard ones.
 */
export function usePaymentActions(withQr: Method[]) {
  const copy = useCopy(paymentCopy);
  const { openViewer, say } = useOverlays();

  const copyAccount = async (m: Method) =>
    say(
      (await copyToClipboard(m.account))
        ? copy.toast.accountCopied(m.name)
        : copy.toast.copyFailed,
    );
  const copyAll = async (m: Method) =>
    say(
      (await copyToClipboard(summaryOf(m, copy)))
        ? copy.toast.allCopied(m.name)
        : copy.toast.copyFailed,
    );

  /** One picture of the viewer: the QR on white, the account under it, and Copy number and Save QR beside the step buttons. */
  const itemOf = (m: Method): ViewerItem => ({
    src: m.qr,
    title: copy.qrTitle(m.name),
    alt: copy.qrAlt(m.name),
    matted: true,
    labels: {
      close: copy.closeQr,
      previous: copy.previousMethod,
      next: copy.nextMethod,
    },
    thumbnailLabel: copy.qrTitle(m.name),
    meta: (
      <div className='flex flex-col gap-0.5'>
        {m.holder && (
          <p>
            {copy.accountName}:{' '}
            <b className='font-bold text-mb-ink'>{m.holder}</b>
          </p>
        )}
        <p>
          {copy.accountNumber}:{' '}
          <b className='font-bold text-mb-ink'>{m.account}</b>
        </p>
      </div>
    ),
    actions: (
      <>
        <MbButton variant='gold' size='sm' onClick={() => void copyAccount(m)}>
          <Copy aria-hidden='true' className='size-3.5' />
          {copy.copyNumber}
        </MbButton>
        <MbButton
          variant='ghost'
          size='sm'
          onClick={() => void saveQr(m, say, copy.toast)}
        >
          <Download aria-hidden='true' className='size-3.5' />
          {copy.saveQr}
        </MbButton>
      </>
    ),
  });

  const openQr = (m: Method) =>
    openViewer(
      withQr.map(itemOf),
      Math.max(
        0,
        withQr.findIndex((x) => x.id === m.id),
      ),
    );

  return { copyAccount, copyAll, openQr };
}
