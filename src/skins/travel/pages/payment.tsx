/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import { travelDeskCopy } from '@/content/copy/travel-desk';
import { useCopy } from '@/lib/i18n/copy';
import { PaymentDesk } from '@/skins/travel/blocks/payment-desk';
import { TlKicker } from '@/skins/travel/ui/tl-card';
import { TlPage } from '@/skins/travel/ui/tl-page';
import { TlPanel } from '@/skins/travel/ui/tl-panel';

/**
 * Payment in the Travel skin: the ticket counter. Each account is a ticket with a tear line, the QR code is the scanner of the counter
 * (the QR window), and with no account on, the counter is closed (the paused card). The map flies to the pier where the counter stands.
 */
export function PaymentPage() {
  const copy = useCopy(paymentCopy);
  const desk = useCopy(travelDeskCopy).payment;
  return (
    <TlPage page='payment'>
      <TlPanel side='right' labelledBy='tl-payment-title'>
        <div className='p-5 pb-6 max-md:p-4'>
          <header>
            <TlKicker aria-hidden='true'>{desk.kicker}</TlKicker>
            <h1
              id='tl-payment-title'
              className='mt-0.5 text-[26px]/[1.15] font-extrabold'
            >
              {copy.title}
            </h1>
            <p className='m-0 mt-1.5 text-tl-muted'>{copy.intro}</p>
            <div aria-hidden='true' className='tl-counter mt-3.5' />
          </header>
          <div className='mt-5'>
            <PaymentDesk />
          </div>
        </div>
      </TlPanel>
    </TlPage>
  );
}
