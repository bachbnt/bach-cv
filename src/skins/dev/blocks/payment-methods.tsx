/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { usePaymentMethods } from '@/components/payment/use-payment-methods';
import { devCopy } from '@/content/copy/dev';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { DevFilterGroup } from '@/skins/dev/blocks/filter-group';
import { PaymentFeature } from '@/skins/dev/blocks/payment-feature';
import { PaymentRow } from '@/skins/dev/blocks/payment-row';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { useDevOverlays } from '@/skins/dev/shell/dev-overlay-context';
import { countHint } from '@/skins/dev/ui/count-hint';
import { DevSection } from '@/skins/dev/ui/dev-section';

/** The note, the highlighted methods, then "More ways to pay" with its bank/wallet filter. */
export function PaymentMethods({ methods }: { methods: Doc<'payments'>[] }) {
  const copy = useCopy(paymentCopy);
  const { hints } = useCopy(devCopy);
  const { openViewer, say } = useDevOverlays();

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
        tags: [{ label: copy.kinds[x.kind], pill: true }],
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
      })),
      withQr.findIndex((x) => x.id === m.id),
    );

  return (
    <>
      <p
        className='mt-5 flex max-w-[740px] items-start gap-2.5 rounded-[8px] border border-dashed border-line-2 bg-chrome px-[17px] py-[13px] font-sans text-[14.5px]/[1.6] font-normal text-mute'
        data-reveal
      >
        <DevIcon name='info' className='mt-[3px] flex-none text-signal' />
        <span>{copy.note}</span>
      </p>

      {featured.length > 0 && (
        <DevSection
          title={rest.length ? copy.preferred : copy.details}
          hint={countHint(hints, 'methods', featured.length)}
        >
          <div className='grid gap-[18px]'>
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
        </DevSection>
      )}

      {rest.length > 0 && (
        <DevSection
          title={featured.length ? copy.more : copy.details}
          hint={countHint(hints, 'methods', rest.length)}
        >
          {kinds.length > 1 && (
            <DevFilterGroup
              label={copy.filterLabel}
              value={filter}
              options={(['all', ...kinds] as const).map((k) => ({
                value: k,
                label: k === 'all' ? copy.filterAll : copy.kinds[k],
              }))}
              onChange={setFilter}
            />
          )}
          <ul className='grid gap-3.5'>
            {shownRows.map((m) => (
              <PaymentRow
                key={m.id}
                method={m}
                onCopy={() => void copyAccount(m)}
                onOpenQr={() => openQr(m)}
              />
            ))}
          </ul>
        </DevSection>
      )}
    </>
  );
}
