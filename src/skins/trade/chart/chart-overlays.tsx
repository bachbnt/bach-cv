/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { tradeChartCopy } from '@/content/copy/trade-chart';
import type { Candle, CareerEntry } from '@/lib/derive/career-series';
import { shell } from '@/lib/content/shell';
import { jobAt } from '@/lib/derive/current-job';
import { useCopy } from '@/lib/i18n/copy';
import { chartStore } from '@/skins/trade/chart/chart-store';
import type { Interval } from '@/skins/trade/chart/chart-types';
import { measure, type Point } from '@/skins/trade/chart/drawings';
import type { Frame } from '@/skins/trade/chart/frame';
import { FlagsLayer, type FlagView } from '@/skins/trade/chart/flags';
import type { NoteAt } from '@/skins/trade/chart/gesture-types';
import { HintPill } from '@/skins/trade/chart/hint-pill';
import {
  CHART_HINT_ID,
  type Indicators,
} from '@/skins/trade/chart/chart-types';
import type { IndicatorData } from '@/skins/trade/chart/indicators';
import { Legend } from '@/skins/trade/chart/legend';
import { MeasureLabel } from '@/skins/trade/chart/measure-label';
import { NoteInput } from '@/skins/trade/chart/note-input';
import { ReplayBar } from '@/skins/trade/chart/replay-bar';
import type { ReplayState } from '@/skins/trade/chart/replay';

/**
 * What sits on top of the picture as HTML: the flags, the legend, the measure label, the box for a note, the hint line, the replay
 * bar and the live regions that say what the crosshair is on and which flag the replay passed.
 */
export function ChartOverlays({
  frame,
  interval,
  toolbar,
  entries,
  flags,
  intro,
  onOpenFlag,
  company,
  candle,
  dateText,
  jobText,
  studyText,
  indicators,
  data,
  index,
  measureBox,
  note,
  onNoteDone,
  hint,
  replay,
  reduced,
  said,
  status,
}: {
  frame: Frame;
  interval: Interval;
  /** the height of the strip with the chart's own buttons (0 when they are in the toolbar of the terminal) */
  toolbar: number;
  entries: CareerEntry[];
  flags: FlagView[];
  intro: boolean;
  onOpenFlag: (flag: FlagView) => void;
  /** the company of the latest job, for the legend */
  company: string;
  candle: Candle | null;
  dateText: string;
  jobText: string;
  studyText: string;
  indicators: Indicators;
  data: IndicatorData;
  /** the bar the legend reads */
  index: number;
  measureBox: { a: Point; b: Point } | null;
  note: NoteAt | null;
  onNoteDone: (text: string | null) => void;
  hint: string;
  replay: ReplayState;
  reduced: boolean;
  /** what the replay announced last */
  said: string;
  /** what a polite live region says about the bar under the crosshair */
  status: string;
}) {
  const copy = useCopy(tradeChartCopy);
  const { layout, price } = frame;
  const jobOf = (t: number) => {
    const found = jobAt(entries, t);
    return found ? `${found.role} · ${found.company}` : copy.measure.before;
  };
  const stats = measureBox ? measure(measureBox.a, measureBox.b) : null;
  return (
    <>
      <FlagsLayer
        flags={flags}
        intro={intro}
        width={layout.plotWidth}
        onOpen={onOpenFlag}
      />
      <Legend
        name={shell.name}
        company={company}
        candle={candle}
        date={dateText}
        job={jobText}
        study={studyText}
        indicators={indicators}
        data={data}
        index={index}
        interval={copy.intervals[interval].short}
        top={toolbar}
        panes={{ rsi: layout.rsi, macd: layout.macd }}
        onMode={chartStore.setIndicator}
      />
      {measureBox && stats && (
        <MeasureLabel
          x={Math.min(
            layout.plotWidth - 110,
            Math.max(
              110,
              (frame.xAt(measureBox.a.t) + frame.xAt(measureBox.b.t)) / 2,
            ),
          )}
          y={Math.min(price.y(measureBox.a.p), price.y(measureBox.b.p)) - 8}
          below={
            Math.min(price.y(measureBox.a.p), price.y(measureBox.b.p)) <
            toolbar + 96
          }
          measure={stats}
          from={jobOf(measureBox.a.t)}
          to={jobOf(measureBox.b.t)}
          up={measureBox.b.p >= measureBox.a.p}
        />
      )}
      {note && (
        <NoteInput
          x={Math.min(layout.plotWidth - 180, note.x)}
          y={note.y}
          onDone={onNoteDone}
        />
      )}
      {hint && <HintPill text={hint} top={toolbar} />}
      {replay.phase !== 'off' && (
        <ReplayBar
          state={replay}
          reduced={reduced}
          bottom={layout.height - layout.axisY + 8}
          onSelect={chartStore.startReplay}
          onPlay={chartStore.setPlaying}
          onStep={() => chartStore.stepReplay(1)}
          onSpeed={chartStore.setSpeed}
          onRealtime={chartStore.exitReplay}
          onExit={chartStore.exitReplay}
        />
      )}
      <p id={CHART_HINT_ID} className='sr-only'>
        {copy.chart.hint}
      </p>
      <p role='status' className='sr-only'>
        {status}
      </p>
      <p
        role='status'
        aria-live='polite'
        data-testid='tv-replay-live'
        className='sr-only'
      >
        {said}
      </p>
    </>
  );
}
