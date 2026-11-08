/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * The short confirmation at the bottom of the screen (a copy, a saved QR). Announced through `role='status'`; it slides up and fades. It is
 * placed in the root of the terminal, because a page that animates in would otherwise become the box that `fixed` is measured from.
 */
export function DeskSnackbar({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  const root = document.querySelector('[data-skin-root="trade"]');
  if (!root) return null;
  return createPortal(
    <div
      role='status'
      aria-live='polite'
      data-testid='payment-toast'
      className={cn(
        'pointer-events-none fixed bottom-20 left-1/2 z-[60] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded border border-tv-line border-l-2 border-l-tv-up bg-tv-tip px-4 py-2.5 text-[13px] font-medium text-white shadow-tv-menu transition-[opacity,translate] duration-160 min-[1101px]:bottom-6',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
      )}
    >
      {message}
    </div>,
    root,
  );
}
