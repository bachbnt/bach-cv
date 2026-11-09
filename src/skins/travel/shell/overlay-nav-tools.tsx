/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TlToolButton } from '@/skins/travel/shell/overlay-tool-button';

/** Previous, the counter and next, at the right end of a toolbar. */
export function TlNavTools({
  prevLabel,
  nextLabel,
  counter,
  onPrev,
  onNext,
}: {
  prevLabel: string;
  nextLabel: string;
  counter?: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className='flex items-center gap-1'>
      <TlToolButton label={prevLabel} onClick={onPrev}>
        <ChevronLeft aria-hidden='true' className='!size-[18px]' />
      </TlToolButton>
      {counter && (
        <span
          aria-live='polite'
          className='min-w-12 text-center text-xs font-bold text-tl-muted tabular-nums'
        >
          {counter}
        </span>
      )}
      <TlToolButton label={nextLabel} onClick={onNext}>
        <ChevronRight aria-hidden='true' className='!size-[18px]' />
      </TlToolButton>
    </div>
  );
}
