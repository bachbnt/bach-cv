/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TvToolButton } from '@/skins/trade/shell/overlay-tool-button';

/** Previous, the counter and next, at the right end of a toolbar. */
export function TvNavTools({
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
    <div className='flex items-center gap-0.5'>
      <TvToolButton label={prevLabel} onClick={onPrev}>
        <ChevronLeft aria-hidden='true' className='size-[18px]' />
      </TvToolButton>
      {counter && (
        <span
          aria-live='polite'
          className='min-w-12 text-center text-xs text-tv-mute tabular-nums'
        >
          {counter}
        </span>
      )}
      <TvToolButton label={nextLabel} onClick={onNext}>
        <ChevronRight aria-hidden='true' className='size-[18px]' />
      </TvToolButton>
    </div>
  );
}
