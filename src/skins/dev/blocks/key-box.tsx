/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The outlined box inside a role or a degree that sets one thing apart (the key project, the thesis). */
export function DevKeyBox({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dev-key-box'
      className={cn(
        'my-3 rounded-[8px] border border-line-2 bg-editor px-4 py-3',
        className,
      )}
      {...props}
    />
  );
}
