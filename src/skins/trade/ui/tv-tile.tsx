/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** The round tile with a letter in it, in the colour of a page or a skill category (decoration). */
const tileVariants = cva(
  'inline-grid flex-none place-items-center rounded-full text-[10px] font-bold text-white',
  {
    variants: {
      tile: {
        accent: 'bg-tv-accent',
        violet: 'bg-tv-violet',
        sky: 'bg-tv-sky',
        orange: 'bg-tv-orange',
        dim: 'bg-tv-dim',
        up: 'bg-tv-up',
        gold: 'bg-tv-gold',
      },
      size: { sm: 'size-4', md: 'size-5' },
    },
    defaultVariants: { size: 'md' },
  },
);

export function TvTile({
  tile,
  size,
  className,
  children,
}: VariantProps<typeof tileVariants> & {
  className?: string;
  children: string;
}) {
  return (
    <span
      aria-hidden='true'
      className={cn(tileVariants({ tile, size }), className)}
    >
      {children}
    </span>
  );
}
