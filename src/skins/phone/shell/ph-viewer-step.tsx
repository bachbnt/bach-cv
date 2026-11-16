/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** The round button that steps to the previous or the next picture (44 px, a finger). */
export function PhViewerStep({
  direction,
  label,
  onStep,
  className,
}: {
  direction: 'previous' | 'next';
  label: string;
  onStep: () => void;
  className?: string;
}) {
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight;
  return (
    <button
      type='button'
      aria-label={label}
      onClick={onStep}
      className={cn(
        'inline-grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-ph-sheet-3 text-ph-ink transition-[scale,background-color] duration-100 hover:bg-ph-line active:scale-[0.94]',
        className,
      )}
    >
      <Icon aria-hidden='true' className='size-6' strokeWidth={2.2} />
    </button>
  );
}
