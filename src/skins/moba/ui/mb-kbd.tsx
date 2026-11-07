/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A key cap. It is decoration beside a control that already has a name, so it is hidden from assistive technology. */
export function MbKbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd aria-hidden='true' className={cn('mb-kbd', className)} {...props} />
  );
}
