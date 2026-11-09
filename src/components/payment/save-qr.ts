/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { qrFileName } from '@/components/payment/payment-details';
import type { Doc } from '@/lib/content/schema';

/** Saves the QR image, or opens it in a new tab when the browser blocks the download (for example no CORS). */
export async function saveQr(
  method: Doc<'payments'>,
  say: (message: string) => void,
  toast: { qrSaved: string; qrOpened: string },
) {
  try {
    const res = await fetch(method.qr);
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = qrFileName(method.name, blob.type, method.qr);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    say(toast.qrSaved);
  } catch {
    window.open(method.qr, '_blank', 'noopener');
    say(toast.qrOpened);
  }
}
