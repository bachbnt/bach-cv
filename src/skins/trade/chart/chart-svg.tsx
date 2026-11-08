/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { KeyboardEvent, PointerEventHandler, RefObject } from 'react';
import type { Candle } from '@/lib/derive/career-series';
import { cn } from '@/lib/utils';
import {
  CHART_HINT_ID,
  type ChartType,
  CursorMode,
  Indicators,
  Interval,
  ToolId,
} from '@/skins/trade/chart/chart-types';
import type { CrosshairInfo } from '@/skins/trade/chart/crosshair-info';
import { CrosshairLayer } from '@/skins/trade/chart/crosshair-layer';
import { DrawingLayer } from '@/skins/trade/chart/drawing-layer';
import type { Drawing, Point } from '@/skins/trade/chart/drawings';
import type { Frame } from '@/skins/trade/chart/frame';
import { GridLayer } from '@/skins/trade/chart/grid-layer';
import type { Hover } from '@/skins/trade/chart/gesture-types';
import type { IndicatorData } from '@/skins/trade/chart/indicators';
import { LastPriceLine } from '@/skins/trade/chart/last-price-line';
import { LastPriceTag } from '@/skins/trade/chart/last-price-tag';
import { MacdPane } from '@/skins/trade/chart/macd-pane';
import { MeasureBox } from '@/skins/trade/chart/measure-box';
import { OverlayLayer } from '@/skins/trade/chart/overlay-layer';
import { PlayheadLayer } from '@/skins/trade/chart/playhead-layer';
import type { ReplayState } from '@/skins/trade/chart/replay';
import { RsiPane } from '@/skins/trade/chart/rsi-pane';
import { seriesFor } from '@/skins/trade/chart/series';
import { SeriesLayer } from '@/skins/trade/chart/series-layer';
import type { Drawn } from '@/skins/trade/chart/use-chart-fade';
import { VolumeLayer } from '@/skins/trade/chart/volume-layer';
import { VolumeTag } from '@/skins/trade/chart/volume-tag';
import type { AxisLabel } from '@/skins/trade/chart/view';

/**
 * The picture of the chart: the grid, the candles (or the other type), the volume, the indicators, the last price, the drawings, the
 * replay playhead and the crosshair, in layers. It takes the pointer and the arrow keys, so it is an application with the label.
 */
export function ChartSvg({
  svg,
  id,
  label,
  roleLabel,
  width,
  height,
  frame,
  type,
  interval,
  tool,
  cursor,
  touchFree,
  handlers,
  onKeyDown,
  onBlur,
  reduced,
  shown,
  series,
  baseline,
  last,
  indicators,
  shownIndicators,
  data,
  labels,
  monthName,
  leaving,
  fading,
  hover,
  shownIndex,
  crosshair,
  dateText,
  drawings,
  draft,
  selected,
  measureBox,
  replay,
  lastWord,
  tick,
}: {
  svg: RefObject<SVGSVGElement | null>;
  /** the prefix of the ids of the clip paths, unique to this chart */
  id: string;
  label: string;
  roleLabel: string;
  width: number;
  height: number;
  frame: Frame;
  type: ChartType;
  interval: Interval;
  tool: ToolId;
  cursor: CursorMode;
  /** a finger may scroll the page over the chart (the plain cursor); a drawing tool takes every touch */
  touchFree: boolean;
  handlers: {
    onPointerDown: PointerEventHandler<SVGSVGElement>;
    onPointerMove: PointerEventHandler<SVGSVGElement>;
    onPointerUp: PointerEventHandler<SVGSVGElement>;
    onPointerLeave: PointerEventHandler<SVGSVGElement>;
    onPointerCancel: PointerEventHandler<SVGSVGElement>;
    onDoubleClick: () => void;
  };
  onKeyDown: (event: KeyboardEvent<SVGSVGElement>) => void;
  onBlur: () => void;
  reduced: boolean;
  /** the real candles up to the playhead, and the ones of the chart type */
  shown: Candle[];
  series: Candle[];
  baseline: number;
  last: number;
  /** what the visitor turned on, and what the chart can draw of it */
  indicators: Indicators;
  shownIndicators: Indicators;
  data: IndicatorData;
  labels: AxisLabel[];
  monthName: (month: number) => string;
  leaving: ChartType | null;
  fading: Drawn | null;
  hover: Hover | null;
  shownIndex: number;
  /** the crosshair to draw, or `null` when there is none */
  crosshair: (CrosshairInfo & { x: number }) | null;
  dateText: string;
  drawings: Drawing[];
  draft: Drawing | null;
  selected: string | null;
  measureBox: { a: Point; b: Point } | null;
  replay: ReplayState;
  /** the word under the price tag of the last close */
  lastWord: string;
  /** the tick of the live candle: the tag flashes when it changes */
  tick: number;
}) {
  const { layout } = frame;
  const volumeOn = indicators.volume === 'shown';
  return (
    <svg
      ref={svg}
      // an image is not interactive; this one takes the focus and the arrow keys, so it is an application with the label
      role='application'
      aria-roledescription={roleLabel}
      aria-label={label}
      aria-describedby={CHART_HINT_ID}
      tabIndex={0}
      viewBox={`0 0 ${width} ${height}`}
      data-testid='tv-chart'
      data-candles={frame.end - frame.start}
      data-type={type}
      data-tool={tool}
      data-cursor={cursor}
      className={cn(
        'absolute inset-0 size-full',
        touchFree ? 'touch-pan-y' : 'touch-none',
        tool === 'cursor' && cursor === 'arrow'
          ? 'cursor-default'
          : 'cursor-crosshair',
      )}
      {...handlers}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
    >
      <defs>
        <clipPath id={`${id}-reveal`}>
          <rect
            className='tv-chart-reveal'
            x={0}
            y={0}
            width={layout.plotWidth}
            height={height}
          />
        </clipPath>
        <clipPath id={`${id}-main`}>
          <rect
            x={0}
            y={layout.main.top}
            width={layout.plotWidth}
            height={layout.main.bottom - layout.main.top}
          />
        </clipPath>
        {[layout.rsi, layout.macd].map(
          (pane, k) =>
            pane && (
              <clipPath key={k} id={`${id}-sub${k}`}>
                <rect
                  x={0}
                  y={pane.top}
                  width={layout.plotWidth}
                  height={pane.bottom - pane.top}
                />
              </clipPath>
            ),
        )}
      </defs>
      <GridLayer frame={frame} labels={labels} monthName={monthName} />
      <g clipPath={`url(#${id}-reveal)`}>
        <g clipPath={`url(#${id}-main)`}>
          {fading && !reduced && (
            <g className='tv-chart-fade-out'>
              {volumeOn && (
                <VolumeLayer
                  candles={fading.shown}
                  frame={fading.frame}
                  average={null}
                  highlight={null}
                />
              )}
              <SeriesLayer
                type={fading.type}
                series={seriesFor(fading.type, fading.shown)}
                baseline={fading.baseline}
                frame={fading.frame}
                id={`${id}-prev`}
              />
            </g>
          )}
          {volumeOn && (
            <g
              key={interval}
              className={fading ? 'tv-chart-fade-in' : undefined}
            >
              <VolumeLayer
                candles={shown}
                frame={frame}
                average={data.volumeMa}
                highlight={hover ? shownIndex : null}
              />
            </g>
          )}
          {leaving && !reduced && (
            <g key={leaving} className='tv-chart-fade-out'>
              <SeriesLayer
                type={leaving}
                series={seriesFor(leaving, shown)}
                baseline={baseline}
                frame={frame}
                id={`${id}-old`}
              />
            </g>
          )}
          <g
            key={`${type}:${interval}`}
            className={leaving || fading ? 'tv-chart-fade-in' : undefined}
          >
            <SeriesLayer
              type={type}
              series={series}
              baseline={baseline}
              frame={frame}
              id={id}
            />
          </g>
          <OverlayLayer
            frame={frame}
            data={data}
            indicators={shownIndicators}
          />
          <LastPriceLine candle={series[last]} frame={frame} />
        </g>
        {layout.rsi && shownIndicators.rsi === 'shown' && (
          <g clipPath={`url(#${id}-sub0)`}>
            <RsiPane frame={frame} data={data} />
          </g>
        )}
        {layout.macd && shownIndicators.macd === 'shown' && (
          <g clipPath={`url(#${id}-sub${layout.rsi ? 1 : 0})`}>
            <MacdPane frame={frame} data={data} />
          </g>
        )}
      </g>
      {volumeOn && <VolumeTag candles={shown} frame={frame} />}
      <LastPriceTag
        candle={series[last]}
        frame={frame}
        label={lastWord}
        tick={tick}
      />
      <DrawingLayer
        drawings={drawings}
        draft={draft}
        selected={selected}
        frame={frame}
        clip={`url(#${id}-main)`}
      />
      <g clipPath={`url(#${id}-main)`}>
        {measureBox && (
          <MeasureBox a={measureBox.a} b={measureBox.b} frame={frame} />
        )}
        {replay.phase === 'ready' && (
          <PlayheadLayer frame={frame} index={replay.at} phase='ready' />
        )}
        {replay.phase === 'select' && hover && (
          <PlayheadLayer frame={frame} index={hover.index} phase='select' />
        )}
      </g>
      {crosshair && (
        <CrosshairLayer
          frame={frame}
          mode={cursor}
          x={crosshair.x}
          y={crosshair.y}
          priceText={crosshair.priceText}
          dateText={dateText}
          pane={crosshair.box}
        />
      )}
    </svg>
  );
}
