/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The kind of a method (Bank, Wallet): a small word in a hand-drawn outline. */
export function PaymentKind({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-block rounded-[12px_9px_11px_10px/10px_11px_9px_12px] border-[1.6px] border-ac-rule px-2.5 pt-px pb-[3px] font-ac-note text-[14px]/[1.2] text-ac-mute',
        className,
      )}
    >
      {children}
    </span>
  );
}
