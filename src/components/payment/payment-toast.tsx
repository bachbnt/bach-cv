/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from 'cn';

/** A short confirmation at the bottom of the screen. Announced to screen readers through `role='status'`. */
export function PaymentToast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  return (
    <div
      role='status'
      aria-live='polite'
      data-testid='payment-toast'
      className={cn(
        'pointer-events-none fixed bottom-24 left-1/2 z-[60] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-xl bg-night px-4 py-2.5 text-[15px] font-medium text-white transition-[opacity,transform] duration-200 min-[721px]:bottom-7',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
      )}
    >
      {message}
    </div>
  );
}
