/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { PageHead } from '@/components/page-head';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';

/** The tinted head of the Payment page, in the visitor's language. */
export function PaymentHead() {
  const copy = useCopy(paymentCopy);
  return <PageHead title={copy.title} intro={copy.intro} />;
}
