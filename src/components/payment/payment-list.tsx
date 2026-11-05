/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Info } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '@/components/payment/copy-to-clipboard';
import { summaryOf, splitMethods } from '@/components/payment/payment-details';
import { DataState } from '@/components/data-state';
import { PaymentEmpty } from '@/components/payment/payment-empty';
import { PaymentFeature } from '@/components/payment/payment-feature';
import { PaymentQrDialog } from '@/components/payment/payment-qr-dialog';
import { PaymentRow } from '@/components/payment/payment-row';
import { PaymentToast } from '@/components/payment/payment-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from 'cn';
import { useContentQuery } from '@/lib/query/use-content';

type Kind = Doc<'payments'>['kind'];
type Filter = 'all' | Kind;

const TOAST_MS = 2000;

/**
 * The payment methods. They are read at run time only (the Firestore rules return the visible ones),
 * so nothing here is in the built files. With none switched on it says payments are paused.
 */
export function PaymentList() {
  const payments = useContentQuery('payments', { featuredFirst: true });
  const methods = payments.data ?? [];
  return (
    <DataState
      query={payments}
      count={methods.length}
      empty='services'
      emptyContent={<PaymentEmpty />}
      subject='payments'
      skeleton={<Skeleton className='h-[260px] max-w-[720px] rounded-3xl' />}
      className='mt-12'
    >
      <PaymentMethods methods={methods} />
    </DataState>
  );
}

/** Highlighted methods first, then "More ways to pay" with a bank/wallet filter. */
function PaymentMethods({ methods }: { methods: Doc<'payments'>[] }) {
  const copy = useCopy(paymentCopy);
  const [filter, setFilter] = useState<Filter>('all');
  const [qrId, setQrId] = useState<string | null>(null);
  const [toast, setToast] = useState({ message: '', visible: false });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const nudge = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(nudge.current);
    },
    [],
  );

  /** Clears the text first so a repeated message is announced again. */
  const say = useCallback((message: string) => {
    clearTimeout(timer.current);
    clearTimeout(nudge.current);
    setToast({ message: '', visible: false });
    nudge.current = setTimeout(() => {
      setToast({ message, visible: true });
      timer.current = setTimeout(
        () => setToast((t) => ({ ...t, visible: false })),
        TOAST_MS,
      );
    }, 20);
  }, []);

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
      <p className='mt-7 flex max-w-[720px] items-start gap-3 rounded-xl border bg-card px-4 py-3.5 text-[15px] leading-normal text-body'>
        <Info
          className='mt-0.5 size-5 flex-none text-page'
          aria-hidden='true'
        />
        <span>{copy.note}</span>
      </p>

      {featured.length > 0 && (
        <section aria-labelledby='pay-featured-h' className='mt-14'>
          <h2
            id='pay-featured-h'
            className='text-[30px] min-[721px]:text-[40px]'
          >
            {rest.length ? copy.preferred : copy.details}
          </h2>
          <div
            className={cn(
              'mt-6 grid grid-cols-1 gap-6',
              featured.length === 1
                ? 'min-[721px]:grid-cols-[minmax(0,720px)]'
                : 'min-[1001px]:grid-cols-2',
            )}
          >
            {featured.map((m) => (
              <PaymentFeature
                key={m.id}
                method={m}
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
        <section aria-labelledby='pay-more-h' className='mt-14'>
          <h2 id='pay-more-h' className='text-[30px] min-[721px]:text-[40px]'>
            {featured.length ? copy.more : copy.details}
          </h2>
          {kinds.length > 1 && (
            <div
              role='group'
              aria-label={copy.filterLabel}
              className='mt-6 flex flex-wrap items-center gap-2.5'
            >
              {(['all', ...kinds] as const).map((k) => (
                <button
                  key={k}
                  type='button'
                  aria-pressed={filter === k}
                  onClick={() => setFilter(k)}
                  className='rounded-full border-[1.5px] bg-card px-[18px] py-[9px] text-[15px] font-medium transition-colors hover:border-foreground active:border-foreground aria-pressed:border-page aria-pressed:bg-page aria-pressed:text-background pointer-coarse:min-h-11'
                >
                  {k === 'all' ? copy.filterAll : copy.kinds[k]}
                  <span className='ml-1.5 tabular-nums opacity-70'>
                    {k === 'all'
                      ? rest.length
                      : rest.filter((m) => m.kind === k).length}
                  </span>
                </button>
              ))}
            </div>
          )}
          <ul className='mt-6 flex list-none flex-col gap-3 p-0'>
            {shownRows.map((m) => (
              <PaymentRow
                key={m.id}
                method={m}
                onCopy={() => void copyAccount(m)}
                onOpenQr={() => setQrId(m.id)}
              />
            ))}
          </ul>
        </section>
      )}

      {qrMethod && (
        <PaymentQrDialog
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
