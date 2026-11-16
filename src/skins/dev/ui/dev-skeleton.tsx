/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useLoopGate } from '@/hooks/use-loop-gate';
import { cn } from '@/lib/utils';

/** A placeholder shape that shimmers while data loads (it is decoration: the surrounding block announces "Loading"). */
export function DevSkeleton({
  className,
  style,
  children,
  ...data
}: {
  className?: string;
  style?: CSSProperties;
  /** blank bars (`DevSkeletonBar`) that give the shape the structure of the card it stands for */
  children?: ReactNode;
  'data-skeleton'?: 'toolbar' | 'item' | 'detail';
}) {
  const gate = useLoopGate();
  return (
    <div
      ref={gate}
      aria-hidden='true'
      className={cn(
        'relative overflow-hidden rounded-[8px] border border-line-2 bg-chrome after:absolute after:inset-0 after:animate-[dv-shimmer_1.4s_ease-in-out_infinite] after:bg-[linear-gradient(90deg,transparent,var(--hover),transparent)] after:content-[""] after:[transform:translateX(-100%)]',
        className,
      )}
      style={style}
      {...data}
    >
      {children}
    </div>
  );
}
