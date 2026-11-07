/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Info, Wallet } from 'lucide-react';
import { startTransition, useState, ViewTransition } from 'react';
import { copyToClipboard } from '@/components/payment/copy-to-clipboard';
import { splitMethods, summaryOf } from '@/components/payment/payment-details';
import { paymentCopy } from '@/content/copy/payment';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { LazyPaymentQrDialog } from '@/skins/trade/blocks/lazy-dialogs';
import { DeskPaymentRecommended } from '@/skins/trade/blocks/desk-payment-recommended';
import {
  DeskPaymentRow,
  PAYMENT_COLUMNS,
} from '@/skins/trade/blocks/desk-payment-row';
import { DeskSection } from '@/skins/trade/blocks/desk-section';
import { DeskSnackbar } from '@/skins/trade/blocks/desk-snackbar';
import { useDeskSnackbar } from '@/skins/trade/blocks/use-desk-snackbar';
import { TvChartSkeleton } from '@/skins/trade/ui/tv-chart-skeleton';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvLink } from '@/skins/trade/ui/tv-button';
import { TvStateNotice } from '@/skins/trade/ui/tv-state-notice';
import { TvToggleChip } from '@/skins/trade/ui/tv-toggle-chip';

type Filter = 'all' | Doc<'payments'>['kind'];

/**
 * The payment methods, read at run time only (the Firestore rules return the visible ones), so nothing here is in the built files. With none
 * switched on it says payments are paused and points to the order ticket on Services.
 */
export function DeskPayment() {
  const copy = useCopy(paymentCopy);
  const payments = useContentQuery('payments', { featuredFirst: true });
  const methods = payments.data ?? [];
  return (
    <div className='p-3.5'>
      <TvDataState
        query={payments}
        count={methods.length}
        empty='services'
        emptyContent={
          <TvStateNotice
            kind='empty'
            icon={Wallet}
            title={copy.empty.title}
            body={copy.empty.body}
          >
            <TvLink variant='outline' href={copy.empty.href}>
              {copy.empty.action}
            </TvLink>
          </TvStateNotice>
        }
        subject='payments'
        skeleton={<TvChartSkeleton className='h-[200px] max-w-[760px]' />}
      >
        <DeskMethods methods={methods} />
      </TvDataState>
    </div>
  );
}

/** The recommended methods first, then the deposit table of the other ways to pay with its bank/wallet filter. */
function DeskMethods({ methods }: { methods: Doc<'payments'>[] }) {
  const copy = useCopy(paymentCopy);
  const desk = useCopy(tradeDeskCopy).payment;
  const [filter, setFilter] = useState<Filter>('all');
  const [qrId, setQrId] = useState<string | null>(null);
  const { snack, say } = useDeskSnackbar();

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
      <div className='@container grid gap-3'>
        <p
          role='note'
          className='flex items-start gap-2.5 rounded-md border border-tv-line border-l-2 border-l-tv-accent bg-tv-panel px-3 py-2.5 text-xs/[1.5]'
        >
          <Info
            className='mt-0.5 size-4 flex-none text-tv-accent-ink'
            aria-hidden='true'
          />
          <span>{copy.note}</span>
        </p>

        {featured.length > 0 && (
          <DeskSection
            id='tv-pay-featured'
            title={rest.length ? copy.preferred : copy.details}
          >
            <div
              className={cn(
                'grid gap-3',
                featured.length > 1 && '@[760px]:grid-cols-2',
              )}
            >
              {featured.map((m) => (
                <DeskPaymentRecommended
                  key={m.id}
                  method={m}
                  onCopy={(kind) =>
                    void (kind === 'all' ? copyAll(m) : copyAccount(m))
                  }
                  onOpenQr={() => setQrId(m.id)}
                />
              ))}
            </div>
          </DeskSection>
        )}

        {rest.length > 0 && (
          <DeskSection
            id='tv-pay-more'
            title={featured.length ? copy.more : copy.details}
            bodyClassName='p-0'
            actions={
              kinds.length > 1 && (
                <div
                  role='group'
                  aria-label={copy.filterLabel}
                  className='flex flex-wrap items-center gap-1.5'
                >
                  {(['all', ...kinds] as const).map((k) => (
                    <TvToggleChip
                      key={k}
                      aria-pressed={filter === k}
                      onClick={() => startTransition(() => setFilter(k))}
                    >
                      {k === 'all' ? copy.filterAll : copy.kinds[k]}
                      <span className='tabular-nums opacity-70'>
                        {k === 'all'
                          ? rest.length
                          : rest.filter((m) => m.kind === k).length}
                      </span>
                    </TvToggleChip>
                  ))}
                </div>
              )
            }
          >
            <div
              aria-hidden='true'
              className={cn(
                'hidden gap-x-4 border-b border-tv-line px-3 py-1.5 text-[11px] text-tv-mute @[760px]:grid',
                PAYMENT_COLUMNS,
              )}
            >
              <span>{desk.method}</span>
              <span>{copy.accountName}</span>
              <span>{copy.accountNumber}</span>
              <span />
            </div>
            <ViewTransition
              key={filter}
              enter='list-in'
              exit='list-out'
              default='none'
            >
              <ul className='m-0 list-none p-0'>
                {shownRows.map((m) => (
                  <DeskPaymentRow
                    key={m.id}
                    method={m}
                    onCopy={() => void copyAccount(m)}
                    onOpenQr={() => setQrId(m.id)}
                  />
                ))}
              </ul>
            </ViewTransition>
          </DeskSection>
        )}
      </div>

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
      <DeskSnackbar message={snack.message} visible={snack.visible} />
    </>
  );
}
