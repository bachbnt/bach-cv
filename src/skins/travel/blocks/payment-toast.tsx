/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * The short confirmation at the bottom of the screen (a copy, a saved QR): a ticket-like pill, announced through `role='status'`, that
 * slides up and fades. It is drawn in the `body`, above the QR window, and not in the page: a card that animates in would otherwise be
 * the box that `fixed` is measured from. On a phone it stands above the bar of the pages.
 */
export function PaymentToast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      role='status'
      aria-live='polite'
      data-testid='payment-toast'
      className={cn(
        'pointer-events-none fixed bottom-[76px] left-1/2 z-[70] flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-2 rounded-2xl bg-tl-ink px-4 py-2.5 text-[14px] font-semibold text-tl-solid shadow-tl-pop transition-[opacity,translate] duration-200 motion-reduce:transition-none min-[768px]:bottom-6',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
      )}
    >
      {message && <Check aria-hidden='true' className='size-4 flex-none' />}
      {message}
    </div>,
    document.body,
  );
}
