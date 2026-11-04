/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Metadata } from 'next';
import { PaymentHead } from '@/components/payment/payment-head';
import { PageShell } from '@/components/page-shell';
import { PaymentList } from '@/components/payment/payment-list';
import { shell } from '@/lib/content/shell';

/** The tab title is English: the page is statically exported, and the language is chosen in the browser. */
export const metadata: Metadata = {
  title: `Payment - ${shell.name}`,
};

export default function PaymentPage() {
  return (
    <PageShell page='payment'>
      <PaymentHead />
      <section className='mx-auto w-full max-w-[1200px] px-5 pt-14 pb-24 min-[721px]:px-12'>
        <PaymentList />
      </section>
    </PageShell>
  );
}
