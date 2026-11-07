/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard } from '@/components/payment/copy-to-clipboard';
import { summaryOf } from '@/components/payment/payment-details';
import { paymentCopy } from '@/content/copy/payment';
import { shell } from '@/lib/content/shell';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { tiersOf, type KindFilter } from '@/skins/stream/blocks/library-model';
import { LibraryJoinTabs } from '@/skins/stream/blocks/library-join-tabs';
import { LibraryPerkRow } from '@/skins/stream/blocks/library-perk-row';
import { LibraryQrViewer } from '@/skins/stream/blocks/library-qr-viewer';
import { LibrarySnackbar } from '@/skins/stream/blocks/library-snackbar';
import { LibraryTier } from '@/skins/stream/blocks/library-tier';
import { PaymentEmpty } from '@/skins/stream/blocks/payment-empty';
import { useLibrarySnackbar } from '@/skins/stream/blocks/use-library-snackbar';
import { ChannelAvatar } from '@/skins/stream/ui/channel-avatar';
import { StreamDataState } from '@/skins/stream/ui/stream-data-state';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

/**
 * The payment page as the Join page of a channel: a header with the owner's picture and the page's title, then the methods as
 * membership levels. They are read at run time only (the Firestore rules return the visible ones); with none switched on it says
 * payments are paused.
 */
export function LibraryJoin() {
  const copy = useCopy(paymentCopy);
  const payments = useContentQuery('payments', { featuredFirst: true });
  const methods = payments.data ?? [];

  return (
    <div className='px-3 min-[701px]:px-0'>
      <header className='sm-lib-band flex items-center gap-4 rounded-2xl p-4 min-[701px]:gap-5 min-[701px]:p-6'>
        <ChannelAvatar size={88} className='size-14 min-[701px]:size-[88px]' />
        <div className='min-w-0'>
          <p className='text-[13px] font-medium text-sm-mute'>{shell.name}</p>
          <h1 className='text-2xl/[1.2] font-bold min-[701px]:text-[32px]/[1.15]'>
            {copy.title}
          </h1>
          <p className='mt-1.5 max-w-[640px] text-sm/[1.5] text-sm-mute'>
            {copy.intro}
          </p>
        </div>
      </header>
      <StreamDataState
        query={payments}
        count={methods.length}
        empty='services'
        emptyContent={<PaymentEmpty />}
        subject='payments'
        skeleton={
          <div className='grid gap-4 min-[1001px]:grid-cols-2'>
            <StreamSkeleton className='h-[300px] rounded-2xl' />
            <StreamSkeleton className='h-[300px] rounded-2xl' />
          </div>
        }
        className='mt-6'
      >
        <LibraryMethods methods={methods} />
      </StreamDataState>
    </div>
  );
}

/** The notice, the featured levels and "More ways to pay" with its bank / wallet tabs, the QR viewer and the snackbar. */
function LibraryMethods({ methods }: { methods: Doc<'payments'>[] }) {
  const copy = useCopy(paymentCopy);
  const [filter, setFilter] = useState<KindFilter>('all');
  const [qrId, setQrId] = useState<string | null>(null);
  const { snack, say } = useLibrarySnackbar();

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

  const { featured, rest, kinds, shown, withQr } = tiersOf(methods, filter);

  return (
    <>
      <p className='mt-6 flex max-w-[760px] items-start gap-3 rounded-xl border border-sm-line px-4 py-3 text-sm/[1.5]'>
        <Info
          className='mt-0.5 size-5 flex-none text-sm-blue'
          aria-hidden='true'
        />
        <span>{copy.note}</span>
      </p>

      <div
        className={cn(
          'mt-8 grid items-start gap-x-8 gap-y-10',
          featured.length > 0 &&
            rest.length > 0 &&
            'min-[1001px]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]',
          rest.length === 0 && 'max-w-[900px]',
          featured.length === 0 && 'max-w-[760px]',
        )}
      >
        {featured.length > 0 && (
          <section aria-labelledby='pay-featured-h'>
            <h2 id='pay-featured-h' className='mb-4 text-xl/[1.3] font-bold'>
              {rest.length ? copy.preferred : copy.details}
            </h2>
            <div
              className={cn(
                'grid gap-4',
                rest.length === 0 && 'min-[701px]:grid-cols-2',
              )}
            >
              {featured.map((m) => (
                <LibraryTier
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
          <section aria-labelledby='pay-more-h'>
            <h2 id='pay-more-h' className='mb-2 text-xl/[1.3] font-bold'>
              {featured.length ? copy.more : copy.details}
            </h2>
            {kinds.length > 1 ? (
              <LibraryJoinTabs
                kinds={kinds}
                rest={rest}
                filter={filter}
                onFilter={setFilter}
              />
            ) : (
              <div className='mb-2' />
            )}
            <ul key={filter} className='m-0 flex list-none flex-col gap-3 p-0'>
              {shown.map((m, i) => (
                <LibraryPerkRow
                  key={m.id}
                  method={m}
                  index={i}
                  onCopy={() => void copyAccount(m)}
                  onOpenQr={() => setQrId(m.id)}
                />
              ))}
            </ul>
          </section>
        )}
      </div>

      <LibraryQrViewer
        methods={withQr}
        openId={qrId}
        onOpenId={setQrId}
        onCopy={(m) => void copyAccount(m)}
        say={say}
      />
      <LibrarySnackbar message={snack.message} visible={snack.visible} />
    </>
  );
}
