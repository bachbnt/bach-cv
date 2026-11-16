/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { saveQr } from '@/components/payment/save-qr';
import { usePaymentMethods } from '@/components/payment/use-payment-methods';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { groupByKind } from '@/lib/derive/payment-kinds';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentFeature } from '@/skins/phone/blocks/payment-feature';
import { PaymentGroup } from '@/skins/phone/blocks/payment-group';
import { PaymentNote } from '@/skins/phone/blocks/payment-note';
import { PaymentPart } from '@/skins/phone/blocks/payment-part';
import { ToggleChip } from '@/skins/phone/blocks/toggle-chip';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';

/**
 * The note about the account name, the highlighted methods as bank cards, then "More ways to pay" grouped by kind with its bank / wallet
 * filter. The QR codes open in the viewer of the shell, which steps through all of them.
 */
export function PaymentMethods({ methods }: { methods: Doc<'payments'>[] }) {
  const copy = useCopy(paymentCopy);
  const { openViewer, say } = usePhOverlays();

  const {
    featured,
    rest,
    kinds,
    shownRows,
    withQr,
    filter,
    setFilter,
    copyAccount,
    copyAll,
  } = usePaymentMethods(methods, say);

  const openQr = (method: Doc<'payments'>) =>
    openViewer(
      withQr.map((m) => ({
        src: m.qr,
        title: copy.qrTitle(m.name),
        subtitle: [m.holder, m.account].filter(Boolean).join(' · '),
        caption: copy.qrAlt(m.name),
        labels: {
          close: copy.closeQr,
          previous: copy.previousMethod,
          next: copy.nextMethod,
        },
        copy: {
          text: m.account,
          label: copy.copyNumber,
          done: copy.toast.accountCopied(m.name),
        },
        save: {
          label: copy.saveQr,
          run: () => saveQr(m, say, copy.toast),
        },
      })),
      withQr.findIndex((m) => m.id === method.id),
    );

  return (
    <>
      <PaymentNote />

      {featured.length > 0 && (
        <PaymentPart title={rest.length ? copy.preferred : copy.details}>
          <div className='grid gap-6'>
            {featured.map((method) => (
              <PaymentFeature
                key={method.id}
                method={method}
                onCopy={(what) =>
                  void (what === 'all' ? copyAll(method) : copyAccount(method))
                }
                onOpenQr={() => openQr(method)}
              />
            ))}
          </div>
        </PaymentPart>
      )}

      {rest.length > 0 && (
        <PaymentPart title={featured.length ? copy.more : copy.details}>
          {kinds.length > 1 && (
            <div
              role='group'
              aria-label={copy.filterLabel}
              className='flex flex-wrap gap-2.5'
            >
              {(['all', ...kinds] as const).map((k) => (
                <ToggleChip
                  key={k}
                  aria-pressed={filter === k}
                  onClick={() => setFilter(k)}
                >
                  {k === 'all' ? copy.filterAll : copy.kinds[k]}
                </ToggleChip>
              ))}
            </div>
          )}
          {groupByKind(shownRows).map((group) => (
            <PaymentGroup
              key={group.kind}
              kind={group.kind}
              methods={group.methods}
              onCopy={(method) => void copyAccount(method)}
              onOpenQr={openQr}
            />
          ))}
        </PaymentPart>
      )}
    </>
  );
}
