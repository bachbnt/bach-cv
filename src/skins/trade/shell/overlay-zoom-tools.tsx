/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Minus, Plus, ScanLine } from 'lucide-react';
import { fill } from '@/lib/chat/fill';
import { TvToolButton } from '@/skins/trade/shell/overlay-tool-button';

/** Zoom out, the level, zoom in and fit to window, for a window whose content has `last + 1` zoom steps and fits at step `fit`. */
export function TvZoomTools({
  words,
  step,
  last,
  fit,
  percent,
  onStep,
  disabled,
}: {
  words: {
    zoomIn: string;
    zoomOut: string;
    zoomFit: string;
    /** has a `{percent}` slot */
    zoomLevel: string;
  };
  step: number;
  last: number;
  fit: number;
  percent: number;
  onStep: (step: number) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <TvToolButton
        label={words.zoomOut}
        disabled={step === 0 || disabled}
        onClick={() => onStep(step - 1)}
      >
        <Minus aria-hidden='true' className='size-4' />
      </TvToolButton>
      <span
        role='img'
        aria-label={fill(words.zoomLevel, { percent })}
        className='min-w-11 text-center text-xs text-tv-mute tabular-nums'
      >
        {percent}%
      </span>
      <TvToolButton
        label={words.zoomIn}
        disabled={step === last || disabled}
        onClick={() => onStep(step + 1)}
      >
        <Plus aria-hidden='true' className='size-4' />
      </TvToolButton>
      <TvToolButton
        label={words.zoomFit}
        disabled={step === fit || disabled}
        onClick={() => onStep(fit)}
      >
        <ScanLine aria-hidden='true' className='size-4' />
      </TvToolButton>
    </>
  );
}
