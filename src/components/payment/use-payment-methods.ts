/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo, useState } from 'react';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import {
  paymentView,
  stepMethodId,
  summaryOf,
  type PaymentFilter,
} from '@/components/payment/payment-details';
import { paymentCopy } from '@/content/copy/payment';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';

/**
 * The state and the actions of the payment page that every skin shares: the bank / wallet filter, the method whose QR is open and the
 * step to the next one, and "Copy number" / "Copy all details", each saying the result through `say` (the snackbar of the skin).
 */
export function usePaymentMethods(
  methods: Doc<'payments'>[],
  say: (message: string) => void,
) {
  const copy = useCopy(paymentCopy);
  const [filter, setFilter] = useState<PaymentFilter>('all');
  const [qrId, setQrId] = useState<string | null>(null);
  const view = useMemo(() => paymentView(methods, filter), [methods, filter]);

  const qrIndex = view.withQr.findIndex((m) => m.id === qrId);
  const qrMethod = qrIndex < 0 ? null : view.withQr[qrIndex];
  const stepQr = (by: number) =>
    setQrId(
      stepMethodId(
        view.withQr.map((m) => m.id),
        qrId,
        by,
      ),
    );

  const copyAccount = async (method: Doc<'payments'>) =>
    say(
      (await copyToClipboard(method.account))
        ? copy.toast.accountCopied(method.name)
        : copy.toast.copyFailed,
    );
  const copyAll = async (method: Doc<'payments'>) =>
    say(
      (await copyToClipboard(summaryOf(method, copy)))
        ? copy.toast.allCopied(method.name)
        : copy.toast.copyFailed,
    );

  return {
    ...view,
    filter,
    setFilter,
    setQrId,
    qrIndex,
    qrMethod,
    stepQr,
    copyAccount,
    copyAll,
  };
}
