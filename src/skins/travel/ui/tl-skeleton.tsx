/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** A placeholder shape that shimmers while data loads (decoration: the block around it announces "Loading"). */
export function TlSkeleton({
  className,
  style,
  children,
  ...data
}: {
  className?: string;
  style?: CSSProperties;
  /** blank bars (`TlSkeletonBar`) that give the shape the structure of the card it stands for */
  children?: ReactNode;
  'data-skeleton'?: 'toolbar' | 'item' | 'detail';
}) {
  return (
    <div
      aria-hidden='true'
      style={style}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-tl-chip after:absolute after:inset-0 after:animate-[tl-shimmer_1.4s_ease-in-out_infinite] after:bg-[linear-gradient(90deg,transparent,var(--tl-panel-2),transparent)] after:content-[""] after:[transform:translateX(-100%)]',
        className,
      )}
      {...data}
    >
      {children}
    </div>
  );
}
