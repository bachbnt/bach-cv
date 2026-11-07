/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A text link in the blue of a video site's links and hashtags. */
export function StreamLink({
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        'text-sm font-medium text-sm-blue hover:underline pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center',
        className,
      )}
      {...props}
    />
  );
}
