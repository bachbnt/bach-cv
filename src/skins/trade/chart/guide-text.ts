/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ToolId } from '@/skins/trade/chart/chart-types';
import type { ReplayState } from '@/skins/trade/chart/replay';

/** The words of the hint line (`copy.hints`). */
export interface Hints {
  select: string;
  one: string;
  note: string;
  eraser: string;
  measure: string;
  second: string;
  first: string;
  keep: string;
}

/** What the hint line says to do next: pick the replay start, or the next click of the tool in use (nothing for the plain cursor). */
export function guideText(
  hints: Hints,
  state: {
    replay: ReplayState['phase'];
    tool: ToolId;
    /** the first click of a two-point drawing or of the measure tool has been made */
    started: boolean;
    /** the measure box is on screen */
    measuring: boolean;
    /** the tool stays on after each drawing */
    sticky: boolean;
  },
): string {
  const { replay, tool, started, measuring, sticky } = state;
  const guide =
    replay === 'select'
      ? hints.select
      : tool === 'cursor'
        ? ''
        : tool === 'hline' || tool === 'vline'
          ? hints.one
          : tool === 'text'
            ? hints.note
            : tool === 'eraser'
              ? hints.eraser
              : tool === 'measure' && !measuring
                ? hints.measure
                : started || measuring
                  ? hints.second
                  : hints.first;
  return guide && sticky ? `${guide} ${hints.keep}` : guide;
}
