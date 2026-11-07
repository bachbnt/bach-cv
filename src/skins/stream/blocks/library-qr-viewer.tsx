/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import type { Doc } from '@/lib/content/schema';
import { stepIndex } from '@/skins/stream/config';

// the QR viewer is Standard's, loaded when a visitor first opens one
const PaymentQrDialog = dynamic(
  () =>
    import('@/components/payment/payment-qr-dialog').then(
      (m) => m.PaymentQrDialog,
    ),
  { ssr: false },
);

/** Standard's QR dialog for the methods that have a code: the same details, Copy number and Save QR, and previous / next with a counter. */
export function LibraryQrViewer({
  methods,
  openId,
  onOpenId,
  onCopy,
  say,
}: {
  /** the methods that have a QR code, in the order the viewer steps through them */
  methods: Doc<'payments'>[];
  openId: string | null;
  onOpenId: (id: string | null) => void;
  onCopy: (method: Doc<'payments'>) => void;
  say: (message: string) => void;
}) {
  const index = methods.findIndex((m) => m.id === openId);
  const method = index < 0 ? null : methods[index];
  if (!method) return null;
  return (
    <PaymentQrDialog
      method={method}
      position={index + 1}
      total={methods.length}
      onStep={(by) =>
        onOpenId(methods[stepIndex(index, by, methods.length)]?.id ?? null)
      }
      onClose={() => onOpenId(null)}
      onCopy={() => onCopy(method)}
      say={say}
    />
  );
}
