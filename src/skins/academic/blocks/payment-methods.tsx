/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useId } from 'react';
import { saveQr } from '@/components/payment/save-qr';
import { usePaymentMethods } from '@/components/payment/use-payment-methods';
import { academicPaymentCopy } from '@/content/copy/academic-payment';
import { paymentCopy } from '@/content/copy/payment';
import { fill } from '@/lib/chat/fill';
import type { Doc } from '@/lib/content/schema';
import { kindCounts } from '@/lib/derive/payment-kinds';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentFeature } from '@/skins/academic/blocks/payment-feature';
import { PaymentTable } from '@/skins/academic/blocks/payment-table';
import { useAcOverlays } from '@/skins/academic/shell/overlay-context';
import { AcChip } from '@/skins/academic/ui/ac-chip';
import { AcNoteBig, AcNoteCap, AcRow } from '@/skins/academic/ui/ac-note';
import { AcPaper } from '@/skins/academic/ui/ac-paper';
import { AcHeading } from '@/skins/academic/ui/ac-section';

/** The note on a sticky slip, the highlighted methods, then "More ways to pay" with its bank / wallet filter; in the margin, how many ways there are. */
export function PaymentMethods({ methods }: { methods: Doc<'payments'>[] }) {
  const copy = useCopy(paymentCopy);
  const words = useCopy(academicPaymentCopy);
  const { openViewer, say } = useAcOverlays();
  const featuredId = useId();
  const moreId = useId();

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

  const openQr = (m: Doc<'payments'>) =>
    openViewer(
      withQr.map((x) => ({
        src: x.qr,
        title: copy.qrTitle(x.name),
        subtitle: [x.holder, x.account].filter(Boolean).join(' · '),
        caption: copy.qrAlt(x.name),
        labels: {
          close: copy.closeQr,
          previous: copy.previousMethod,
          next: copy.nextMethod,
        },
        copy: {
          text: x.account,
          label: copy.copyNumber,
          done: copy.toast.accountCopied(x.name),
        },
        save: {
          label: copy.saveQr,
          run: () => saveQr(x, say, copy.toast),
        },
      })),
      withQr.findIndex((x) => x.id === m.id),
    );

  const counts = kindCounts(methods);

  return (
    <AcRow
      tone='d'
      sticky
      note={
        <>
          <AcNoteBig>{fill(words.noteTotal, { n: counts.total })}</AcNoteBig>
          {counts.kinds.map(({ kind, count }) => (
            <AcNoteCap key={kind}>
              {fill(words.noteKind, { kind: copy.kinds[kind], n: count })}
            </AcNoteCap>
          ))}
        </>
      }
    >
      <AcPaper kind='sticky' className='mt-1'>
        <p className='m-0'>{copy.note}</p>
      </AcPaper>

      {featured.length > 0 && (
        <section aria-labelledby={featuredId} className='mt-12'>
          <AcHeading id={featuredId}>
            {rest.length ? copy.preferred : copy.details}
          </AcHeading>
          <div className='mt-6 grid gap-8'>
            {featured.map((m) => (
              <PaymentFeature
                key={m.id}
                method={m}
                onCopy={(what) =>
                  void (what === 'all' ? copyAll(m) : copyAccount(m))
                }
                onOpenQr={() => openQr(m)}
              />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section aria-labelledby={moreId} className='mt-12'>
          <AcHeading id={moreId}>
            {featured.length ? copy.more : copy.details}
          </AcHeading>
          {kinds.length > 1 && (
            <div
              role='group'
              aria-label={copy.filterLabel}
              className='mt-5 flex flex-wrap items-center gap-2.5'
            >
              {(['all', ...kinds] as const).map((k) => (
                <AcChip
                  key={k}
                  aria-pressed={filter === k}
                  onClick={() => setFilter(k)}
                >
                  {k === 'all' ? copy.filterAll : copy.kinds[k]}
                </AcChip>
              ))}
            </div>
          )}
          <div className='mt-5'>
            <PaymentTable
              methods={shownRows}
              onCopy={(m) => void copyAccount(m)}
              onOpenQr={openQr}
            />
          </div>
        </section>
      )}
    </AcRow>
  );
}
