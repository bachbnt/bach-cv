/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { mobaCopy } from '@/content/copy/moba';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { mbButton } from '@/skins/moba/ui/mb-button';
import { MbStateNotice } from '@/skins/moba/ui/mb-state-notice';

/** Shown when no method is switched on: payments are paused, and the way on is the contact form of Services. */
export function PaymentEmpty() {
  const copy = useCopy(paymentCopy).empty;
  const mb = useCopy(mobaCopy).states;
  return (
    <div className='px-6 py-4 max-[719px]:px-4'>
      <MbStateNotice
        kind='empty'
        kicker={mb.emptyKicker}
        title={copy.title}
        body={copy.body}
      >
        <Link href={copy.href} className={mbButton({ variant: 'gold' })}>
          {copy.action}
        </Link>
      </MbStateNotice>
    </div>
  );
}
