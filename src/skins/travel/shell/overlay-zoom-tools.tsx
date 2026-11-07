/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Minus, Plus, ScanLine } from 'lucide-react';
import { fill } from '@/lib/chat/fill';
import { TlToolButton } from '@/skins/travel/shell/overlay-tool-button';

/** Zoom out, the level, zoom in and fit to window, for content that has `last + 1` zoom steps and fits at step `fit`. */
export function TlZoomTools({
  words,
  step,
  last,
  fit,
  percent,
  onStep,
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
}) {
  return (
    <>
      <TlToolButton
        label={words.zoomOut}
        disabled={step === 0}
        onClick={() => onStep(step - 1)}
      >
        <Minus aria-hidden='true' />
      </TlToolButton>
      <span
        role='img'
        aria-label={fill(words.zoomLevel, { percent })}
        className='min-w-11 text-center text-xs font-bold text-tl-muted tabular-nums'
      >
        {percent}%
      </span>
      <TlToolButton
        label={words.zoomIn}
        disabled={step === last}
        onClick={() => onStep(step + 1)}
      >
        <Plus aria-hidden='true' />
      </TlToolButton>
      <TlToolButton
        label={words.zoomFit}
        disabled={step === fit}
        onClick={() => onStep(fit)}
      >
        <ScanLine aria-hidden='true' />
      </TlToolButton>
    </>
  );
}
