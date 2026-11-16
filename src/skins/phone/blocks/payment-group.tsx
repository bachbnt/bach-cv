/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import {
  PAYMENT_GROUP_LIST,
  PaymentRow,
} from '@/skins/phone/blocks/payment-row';
import { PhSection } from '@/skins/phone/ui/ph-section';

/** The methods of one kind (Bank, Wallet) as a grouped list: a small heading, then one card whose rows are divided by a hairline. */
export function PaymentGroup({
  kind,
  methods,
  onCopy,
  onOpenQr,
}: {
  kind: Doc<'payments'>['kind'];
  methods: Doc<'payments'>[];
  onCopy: (method: Doc<'payments'>) => void;
  onOpenQr: (method: Doc<'payments'>) => void;
}) {
  const copy = useCopy(paymentCopy);
  return (
    <PhSection title={copy.kinds[kind]} level={3} className='mt-5'>
      <ul className={PAYMENT_GROUP_LIST}>
        {methods.map((method) => (
          <PaymentRow
            key={method.id}
            method={method}
            onCopy={() => onCopy(method)}
            onOpenQr={() => onOpenQr(method)}
          />
        ))}
      </ul>
    </PhSection>
  );
}
