/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useId } from 'react';
import {
  Pause,
  Play,
  Scissors,
  SkipForward,
  StepForward,
  X,
} from 'lucide-react';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import {
  REPLAY_SPEEDS,
  type ReplaySpeed,
  type ReplayState,
} from '@/skins/trade/chart/replay';
import { HintTip } from '@/skins/trade/chart/hint-tip';
import { tvButton } from '@/skins/trade/ui/tv-button';

const icon = cn(tvButton({ variant: 'ghost', size: 'icon' }), 'size-8');

/**
 * The bar of the bar replay, at the bottom of the chart: choose the first bar again, play or pause, step one bar, change the speed,
 * jump to real time or leave. With reduced motion there is no autoplay: Play says so and the visitor steps by hand.
 */
export function ReplayBar({
  state,
  reduced,
  bottom,
  onSelect,
  onPlay,
  onStep,
  onSpeed,
  onRealtime,
  onExit,
}: {
  state: ReplayState;
  reduced: boolean;
  /** the distance from the bottom of the chart, above the time axis */
  bottom: number;
  onSelect: () => void;
  onPlay: (playing: boolean) => void;
  onStep: () => void;
  onSpeed: (speed: ReplaySpeed) => void;
  onRealtime: () => void;
  onExit: () => void;
}) {
  const copy = useCopy(tradeChartCopy).replay;
  const note = useId();
  const selecting = state.phase === 'select';
  const PlayIcon = state.playing ? Pause : Play;
  return (
    <div
      role='toolbar'
      aria-label={copy.label}
      data-testid='tv-replay-bar'
      style={{ bottom }}
      className='tv-chart-rise absolute left-1/2 z-[5] flex max-w-[calc(100%-16px)] -translate-x-1/2 items-center gap-0.5 overflow-x-auto rounded-md border border-tv-line bg-tv-panel p-0.5 shadow-tv-menu'
    >
      <HintTip label={copy.select} side='top'>
        <button
          type='button'
          aria-pressed={selecting}
          aria-label={copy.select}
          onClick={onSelect}
          className={cn(icon, selecting && 'bg-tv-hover text-tv-accent-ink')}
        >
          <Scissors aria-hidden='true' />
        </button>
      </HintTip>
      {!selecting && (
        <>
          <HintTip
            label={
              reduced ? copy.motion : state.playing ? copy.pause : copy.play
            }
            side='top'
          >
            <button
              type='button'
              aria-label={state.playing ? copy.pause : copy.play}
              aria-disabled={reduced || undefined}
              aria-describedby={reduced ? note : undefined}
              onClick={() => {
                if (!reduced) onPlay(!state.playing);
              }}
              className={cn(icon, reduced && 'opacity-50')}
            >
              <PlayIcon aria-hidden='true' />
            </button>
          </HintTip>
          {reduced && (
            <span id={note} className='sr-only'>
              {copy.motion}
            </span>
          )}
          <HintTip label={copy.step} side='top'>
            <button
              type='button'
              aria-label={copy.step}
              onClick={onStep}
              className={icon}
            >
              <StepForward aria-hidden='true' />
            </button>
          </HintTip>
          <div
            role='group'
            aria-label={copy.speed}
            className='mx-0.5 flex items-center rounded bg-tv-bg p-0.5'
          >
            {REPLAY_SPEEDS.map((speed) => (
              <button
                key={speed}
                type='button'
                aria-pressed={state.speed === speed}
                onClick={() => onSpeed(speed)}
                className={cn(
                  'h-7 min-w-9 cursor-pointer rounded px-1.5 text-xs tabular-nums transition-[background-color,color,scale] duration-100 hover:bg-tv-hover active:scale-95 active:bg-tv-hover pointer-coarse:h-9 pointer-coarse:min-w-11',
                  state.speed === speed &&
                    'bg-tv-accent/15 text-tv-accent-ink hover:bg-tv-accent/25 active:bg-tv-accent/25',
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
          <HintTip label={copy.realtime} side='top'>
            <button
              type='button'
              aria-label={copy.realtime}
              onClick={onRealtime}
              className={icon}
            >
              <SkipForward aria-hidden='true' />
            </button>
          </HintTip>
        </>
      )}
      <HintTip label={copy.exit} side='top'>
        <button
          type='button'
          aria-label={copy.exit}
          onClick={onExit}
          className={icon}
        >
          <X aria-hidden='true' />
        </button>
      </HintTip>
    </div>
  );
}
