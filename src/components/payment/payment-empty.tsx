/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Wallet } from 'lucide-react';
import { IntentLink } from '@/components/intent-link';
import { StateNotice } from '@/components/state-notice';
import { buttonVariants } from '@/components/ui/button';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';

/** Shown when no method is switched on. Sends the visitor to the contact form on Services instead. */
export function PaymentEmpty() {
  const copy = useCopy(paymentCopy);
  const { empty } = copy;
  return (
    <StateNotice
      kind='empty'
      title={empty.title}
      body={empty.body}
      className='mt-12'
      icon={
        <span
          aria-hidden='true'
          className='flex size-14 items-center justify-center rounded-2xl bg-page-tint text-page'
        >
          <Wallet className='size-7' strokeWidth={1.8} />
        </span>
      }
    >
      <IntentLink href={empty.href} className={buttonVariants()}>
        {empty.action}
      </IntentLink>
    </StateNotice>
  );
}
