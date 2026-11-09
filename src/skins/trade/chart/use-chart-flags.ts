/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useMemo } from 'react';
import { fill } from '@/lib/chat/fill';
import { useLive } from '@/hooks/use-live';
import {
  type Candle,
  type CareerEntry,
  type CareerMarker,
} from '@/lib/derive/career-series';
import { formatPeriod } from '@/lib/format';
import type { Lang } from '@/lib/content/schema';
import type { ChartType } from '@/skins/trade/chart/chart-types';
import { onChart, type Study } from '@/skins/trade/chart/education';
import { spreadFlags } from '@/skins/trade/chart/flag-spread';
import type { FlagView } from '@/skins/trade/chart/flags';
import type { Frame } from '@/skins/trade/chart/frame';
import { flagsUpTo, type ReplayState } from '@/skins/trade/chart/replay';
import { isLineType } from '@/skins/trade/chart/series';
import type { TimeAxis } from '@/skins/trade/chart/time-axis';

/** What a flag stands for: a job (its marker) or a degree, on the bar it falls on. */
export type ChartFlag =
  | { kind: 'job'; index: number; marker: CareerMarker }
  | { kind: 'degree'; index: number; study: Study };

/** The width a flag takes: two jobs on one bar sit side by side so that both stay reachable. */
const FLAG_STEP = 24;

/** The words of a flag (`copy.chart.openJob` and `.openDegree`). */
export interface FlagWords {
  openJob: string;
  openDegree: string;
}

/**
 * The flags of the jobs, then the graduation flags of the degrees, each on the bar it falls on (a degree at the end of its last month,
 * or at its start while it goes on), as the layer draws them. `items` are all of them (the replay announces from that list); `flags`
 * are the ones the replay has reached. Rebuilt only when the window, the series or the language change, not on every pointer frame,
 * so the memo of `FlagsLayer` holds while the crosshair moves.
 */
export function useChartFlags({
  markers,
  studies,
  entries,
  axis,
  count,
  series,
  type,
  frame,
  replay,
  lang,
  words,
  onOpenJob,
  onOpenDegree,
}: {
  markers: CareerMarker[];
  studies: Study[];
  entries: CareerEntry[];
  axis: TimeAxis;
  count: number;
  series: Candle[];
  type: ChartType;
  frame: Frame;
  replay: ReplayState;
  lang: Lang;
  words: FlagWords;
  onOpenJob: (id: string) => void;
  onOpenDegree: (id: string) => void;
}) {
  const { ts, price, layout } = frame;
  // a flag opens a row of Resume: with that page off (coming soon or hidden) it would end on a screen that says so, so it only tells what it is
  const openable = useLive().pages.resume === 'on';
  const items = useMemo<ChartFlag[]>(
    () => [
      ...markers.map((marker): ChartFlag => ({
        kind: 'job',
        index: marker.index,
        marker,
      })),
      // a degree whose mark falls before the first candle or after the last is not on the chart (no clamping to the nearest bar)
      ...studies.flatMap((study): ChartFlag[] =>
        onChart(study.flagAt, axis.time(-0.5), axis.time(count - 0.5))
          ? [
              {
                kind: 'degree',
                index: Math.min(
                  count - 1,
                  Math.max(0, Math.round(axis.index(study.flagAt))),
                ),
                study,
              },
            ]
          : [],
      ),
    ],
    [markers, studies, axis, count],
  );
  const replaying = replay.phase === 'ready';
  const replayAt = replaying ? replay.at : -1;
  const flagged = useMemo(
    () => (replaying ? flagsUpTo(items, replayAt) : items),
    [replaying, items, replayAt],
  );
  // flags that would touch (the same bar, or bars a few pixels apart) are spread, so none hides another
  const flagX = useMemo(
    () =>
      spreadFlags(
        flagged.map((item) => ts.x(item.index)),
        FLAG_STEP,
        layout.plotWidth,
      ),
    [flagged, ts, layout.plotWidth],
  );
  const entryById = useMemo(
    () => new Map(entries.map((entry) => [entry.id, entry])),
    [entries],
  );
  const flags = useMemo(
    () =>
      flagged.flatMap((item, at): FlagView[] => {
        const k = series[item.index];
        if (!k) return [];
        const x = flagX[at];
        const y = Math.min(
          layout.main.bottom - 24,
          (isLineType(type) ? price.y(k.c) : price.y(k.l)) + 12,
        );
        const common = {
          openable,
          x,
          y,
          inside: ts.x(item.index) >= 0 && ts.x(item.index) <= layout.plotWidth,
          above: y > layout.main.bottom - 90,
        };
        if (item.kind === 'degree') {
          const { study } = item;
          const period = formatPeriod(study.startMonth, study.endMonth, lang);
          return [
            {
              ...common,
              kind: 'degree' as const,
              id: study.id,
              current: false,
              label: openable
                ? fill(words.openDegree, {
                    degree: study.degree,
                    school: study.school,
                  })
                : [study.degree, study.school].join(', '),
              tip: [study.degree, study.major, study.school, period],
            },
          ];
        }
        const { marker } = item;
        const entry = entryById.get(marker.id);
        return [
          {
            ...common,
            kind: 'job' as const,
            id: marker.id,
            current: marker.current,
            label: openable
              ? fill(words.openJob, {
                  role: marker.role,
                  company: marker.company,
                })
              : [marker.role, marker.company].join(', '),
            tip: [
              marker.company,
              marker.role,
              entry ? formatPeriod(entry.startMonth, entry.endMonth, lang) : '',
            ],
          },
        ];
      }),
    [
      flagged,
      flagX,
      entryById,
      series,
      type,
      price,
      layout,
      ts,
      lang,
      words.openDegree,
      words.openJob,
      openable,
    ],
  );
  const openFlag = useCallback(
    (flag: FlagView) => {
      if (!flag.openable) return;
      if (flag.kind === 'job') onOpenJob(flag.id);
      else onOpenDegree(flag.id);
    },
    [onOpenJob, onOpenDegree],
  );
  return { items, flags, openFlag };
}
