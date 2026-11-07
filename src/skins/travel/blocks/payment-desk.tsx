/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Info } from 'lucide-react';
import { startTransition, useState, ViewTransition } from 'react';
import { copyToClipboard } from '@/components/payment/copy-to-clipboard';
import { splitMethods, summaryOf } from '@/components/payment/payment-details';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { LazyPaymentQrDialog } from '@/skins/travel/blocks/lazy-dialogs';
import { PaymentFilterChip } from '@/skins/travel/blocks/payment-filter-chip';
import { PaymentTicket } from '@/skins/travel/blocks/payment-ticket';
import { PaymentTicketRow } from '@/skins/travel/blocks/payment-ticket-row';
import { PaymentToast } from '@/skins/travel/blocks/payment-toast';
import { usePaymentToast } from '@/skins/travel/blocks/use-payment-toast';
import { STOP_COLORS } from '@/skins/travel/config';
import { TlButtonLink } from '@/skins/travel/ui/tl-button';
import { TlDataState } from '@/skins/travel/ui/tl-data-state';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';
import { TlStateNotice } from '@/skins/travel/ui/tl-state-notice';
import { travelDeskCopy } from '@/content/copy/travel-desk';

type Filter = 'all' | Doc<'payments'>['kind'];

/** The colour of the n-th ticket (1 to 6, then round again), so the counter looks like a row of different windows. */
const colorOf = (index: number) => (index % STOP_COLORS) + 1;

/**
 * The payment methods, read at run time only (the Firestore rules return the visible ones), so nothing here is in the built files. With
 * none switched on it says payments are paused and points to the contact form on Services.
 */
export function PaymentDesk() {
  const copy = useCopy(paymentCopy);
  const desk = useCopy(travelDeskCopy).payment;
  const payments = useContentQuery('payments', { featuredFirst: true });
  const methods = payments.data ?? [];
  return (
    <TlDataState
      query={payments}
      count={methods.length}
      empty='services'
      emptyContent={
        <TlStateNotice
          kind='empty'
          kicker={desk.closed}
          title={copy.empty.title}
          body={copy.empty.body}
        >
          <TlButtonLink variant='solid' href={copy.empty.href}>
            {copy.empty.action}
          </TlButtonLink>
        </TlStateNotice>
      }
      subject='payments'
      skeleton={
        <div className='grid gap-4'>
          <TlSkeleton className='h-36 rounded-3xl' />
          <TlSkeleton className='h-36 rounded-3xl' />
        </div>
      }
    >
      <PaymentMethods methods={methods} />
    </TlDataState>
  );
}

/** The highlighted methods first as tickets of the windows, then "More ways to pay" as smaller tickets with a bank/wallet filter. */
function PaymentMethods({ methods }: { methods: Doc<'payments'>[] }) {
  const copy = useCopy(paymentCopy);
  const [filter, setFilter] = useState<Filter>('all');
  const [qrId, setQrId] = useState<string | null>(null);
  const { toast, say } = usePaymentToast();

  const copyAccount = async (m: Doc<'payments'>) =>
    say(
      (await copyToClipboard(m.account))
        ? copy.toast.accountCopied(m.name)
        : copy.toast.copyFailed,
    );
  const copyAll = async (m: Doc<'payments'>) =>
    say(
      (await copyToClipboard(summaryOf(m, copy)))
        ? copy.toast.allCopied(m.name)
        : copy.toast.copyFailed,
    );

  const { featured, rest } = splitMethods(methods);
  const withQr = [...featured, ...rest].filter((m) => m.qr);
  const qrIndex = withQr.findIndex((m) => m.id === qrId);
  const qrMethod = qrIndex < 0 ? null : withQr[qrIndex];
  const stepQr = (by: number) =>
    setQrId(withQr[(qrIndex + by + withQr.length) % withQr.length]?.id ?? null);

  const kinds = (['bank', 'wallet'] as const).filter((k) =>
    rest.some((m) => m.kind === k),
  );
  const shownRows = rest.filter((m) => filter === 'all' || m.kind === filter);

  return (
    <>
      <p
        role='note'
        className='m-0 flex items-start gap-2.5 rounded-2xl border border-dashed border-tl-line bg-tl-panel-2 px-3.5 py-3 text-[13.5px]/[1.5]'
      >
        <Info
          className='mt-0.5 size-[18px] flex-none text-tl-coral'
          aria-hidden='true'
        />
        <span>{copy.note}</span>
      </p>

      {featured.length > 0 && (
        <section aria-labelledby='tl-pay-featured' className='mt-6'>
          <h2 id='tl-pay-featured' className='text-[17px] font-extrabold'>
            {rest.length ? copy.preferred : copy.details}
          </h2>
          <div className='mt-3 grid gap-4'>
            {featured.map((m, i) => (
              <PaymentTicket
                key={m.id}
                method={m}
                window={i + 1}
                color={colorOf(i)}
                onCopy={(kind) =>
                  void (kind === 'all' ? copyAll(m) : copyAccount(m))
                }
                onOpenQr={() => setQrId(m.id)}
              />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section aria-labelledby='tl-pay-more' className='mt-7'>
          <h2 id='tl-pay-more' className='text-[17px] font-extrabold'>
            {featured.length ? copy.more : copy.details}
          </h2>
          {kinds.length > 1 && (
            <div
              role='group'
              aria-label={copy.filterLabel}
              className='mt-3 flex flex-wrap items-center gap-2'
            >
              {(['all', ...kinds] as const).map((k) => (
                <PaymentFilterChip
                  key={k}
                  aria-pressed={filter === k}
                  onClick={() => startTransition(() => setFilter(k))}
                >
                  {k === 'all' ? copy.filterAll : copy.kinds[k]}
                  <span className='tabular-nums opacity-75'>
                    {k === 'all'
                      ? rest.length
                      : rest.filter((m) => m.kind === k).length}
                  </span>
                </PaymentFilterChip>
              ))}
            </div>
          )}
          <ViewTransition
            key={filter}
            enter='list-in'
            exit='list-out'
            default='none'
          >
            <ul className='m-0 mt-3 grid list-none gap-3.5 p-0'>
              {shownRows.map((m, i) => (
                <PaymentTicketRow
                  key={m.id}
                  method={m}
                  color={colorOf(featured.length + i)}
                  onCopy={() => void copyAccount(m)}
                  onOpenQr={() => setQrId(m.id)}
                />
              ))}
            </ul>
          </ViewTransition>
        </section>
      )}

      {qrMethod && (
        <LazyPaymentQrDialog
          method={qrMethod}
          position={qrIndex + 1}
          total={withQr.length}
          onStep={stepQr}
          onClose={() => setQrId(null)}
          onCopy={() => void copyAccount(qrMethod)}
          say={say}
        />
      )}
      <PaymentToast message={toast.message} visible={toast.visible} />
    </>
  );
}
