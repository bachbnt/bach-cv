/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';

/** The snackbar of a video site: a dark pill at the bottom left (above the bottom navigation on a phone), announced by `role='status'`. */
export function LibrarySnackbar({
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
        'pointer-events-none fixed bottom-[76px] left-3 z-[60] max-w-[calc(100vw-24px)] rounded-lg bg-sm-ink px-4 py-3 text-sm font-medium text-sm-bg shadow-lg transition-[opacity,transform] duration-200 min-[701px]:bottom-6 min-[701px]:left-6',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
      )}
    >
      {message}
    </div>
  );
}
