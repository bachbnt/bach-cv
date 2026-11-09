/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { RefObject } from 'react';
import type { Candle } from '@/lib/derive/career-series';
import type { ToolId } from '@/skins/trade/chart/chart-types';
import type { Drawing, DrawingKind, Point } from '@/skins/trade/chart/drawings';
import type { Frame } from '@/skins/trade/chart/frame';
import type { ChartView } from '@/skins/trade/chart/use-chart-view';
import type { Limits, View } from '@/skins/trade/chart/view';

export interface Hover {
  /** the bar under the crosshair */
  index: number;
  /** the height of the pointer; `null` when the keyboard moved the crosshair (it then sits on the close) */
  y: number | null;
}

export interface GestureContext {
  svg: RefObject<SVGSVGElement | null>;
  frame: Frame;
  /** the real candles up to the playhead */
  candles: Candle[];
  /** how many bars the whole career has and how far zoom and pan may go */
  limits: Limits;
  /** the tool, for what is drawn while it is chosen (the gestures read the shared state themselves, so a key pressed a moment ago counts) */
  tool: ToolId;
  chartView: ChartView;
  setManual: (range: { lo: number; hi: number } | null) => void;
  setHover: (hover: Hover | null) => void;
}

/** What the pointer is doing between a press and its release. */
export type Gesture =
  | { kind: 'none' }
  | { kind: 'pan'; x: number; y: number; from: number; moved: boolean }
  | { kind: 'scale'; y: number; lo: number; hi: number; log: boolean }
  | { kind: 'time'; x: number; view: View }
  | { kind: 'move'; origin: Point; drawing: Drawing }
  | { kind: 'handle'; index: number; drawing: Drawing }
  | { kind: 'pinch'; distance: number; view: View; anchor: number };

/** The first click of a drawing made with two clicks (or a drag): where it was, on screen and in data. */
export interface Pending {
  kind: DrawingKind | 'measure';
  first: Point;
  x: number;
  y: number;
}

export interface NoteAt {
  point: Point;
  x: number;
  y: number;
}
