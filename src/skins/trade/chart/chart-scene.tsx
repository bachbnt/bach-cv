/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { certificatesCopy } from '@/content/copy/certificates';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import { fill } from '@/lib/chat/fill';
import {
  tickCandle,
  type Bars,
  type CareerEntry,
  type CareerMarker,
} from '@/lib/derive/career-series';
import { jobAt } from '@/lib/derive/current-job';
import { degreeAt } from '@/lib/derive/latest-degree';
import { formatMonthAt, shortMonthName } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { chartStore, useChartStore } from '@/skins/trade/chart/chart-store';
import type { Interval } from '@/skins/trade/chart/chart-types';
import { ChartOverlays } from '@/skins/trade/chart/chart-overlays';
import { ChartSvg } from '@/skins/trade/chart/chart-svg';
import { ChartToolbar } from '@/skins/trade/chart/chart-toolbar';
import { barLabeler } from '@/skins/trade/chart/bar-label';
import { crosshairInfo } from '@/skins/trade/chart/crosshair-info';
import type { Drawing } from '@/skins/trade/chart/drawings';
import { studyText, type Study } from '@/skins/trade/chart/education';
import { buildFrame, type Frame } from '@/skins/trade/chart/frame';
import type { Hover } from '@/skins/trade/chart/gesture-types';
import { guideText } from '@/skins/trade/chart/guide-text';
import {
  availableIndicators,
  computeIndicators,
} from '@/skins/trade/chart/indicators';
import { seriesFor } from '@/skins/trade/chart/series';
import type { TimeAxis } from '@/skins/trade/chart/time-axis';
import { useChartFade } from '@/skins/trade/chart/use-chart-fade';
import { useChartFlags } from '@/skins/trade/chart/use-chart-flags';
import {
  useChartKeyboard,
  useChartShortcuts,
} from '@/skins/trade/chart/use-chart-keys';
import type { ChartView } from '@/skins/trade/chart/use-chart-view';
import { useCoarse } from '@/skins/trade/chart/use-coarse';
import { usePointerGestures } from '@/skins/trade/chart/use-pointer-gestures';
import { useReplayAnnouncer } from '@/skins/trade/chart/use-replay-announcer';
import {
  axisLabels,
  toolbarHeight,
  type Limits,
  type View,
} from '@/skins/trade/chart/view';
import { CHART_CONTROLS_ID } from '@/skins/trade/shell/toolbar';
import { useDocumentHidden } from '@/hooks/use-document-hidden';
import { useOnceTrue } from '@/hooks/use-once-true';
import { useOnScreen } from '@/skins/trade/shell/use-on-screen';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const IndicatorsDialog = dynamic(
  () => import('@/skins/trade/chart/indicators-dialog'),
  { ssr: false },
);
const ShortcutsDialog = dynamic(
  () => import('@/skins/trade/chart/shortcuts-dialog'),
  { ssr: false },
);

const TICK_MS = 2000;
const INTRO_MS = 2400;
/** The drawings of a chart whose drawings are hidden: one array, so the layer (which is memoized) does not see a new one each frame. */
const NO_DRAWINGS: Drawing[] = [];

/**
 * The chart for one window of the career and one interval: the state the pointer and the keys act on (crosshair, price range, live
 * tick), the series, indicators and frame worked out from it, and the picture and the HTML over it.
 */
export function ChartScene({
  bars,
  axis,
  limits,
  interval,
  markers,
  entries,
  studies,
  width,
  height,
  view,
  chartView,
  onOpenJob,
  onOpenDegree,
}: {
  bars: Bars;
  axis: TimeAxis;
  limits: Limits;
  interval: Interval;
  markers: CareerMarker[];
  entries: CareerEntry[];
  studies: Study[];
  width: number;
  height: number;
  view: View;
  chartView: ChartView;
  onOpenJob: (id: string) => void;
  onOpenDegree: (id: string) => void;
}) {
  const copy = useCopy(tradeChartCopy);
  // the tag of the last price says what the Certificates page says of its newest one
  const latestWord = useCopy(certificatesCopy).latest;
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const coarse = useCoarse();
  // the controls go into the top toolbar of the terminal when it has a place for them; the chart then needs no strip of its own
  const [host] = useState(() => document.getElementById(CHART_CONTROLS_ID));
  const toolbar = host ? 0 : toolbarHeight(coarse);
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const svg = useRef<SVGSVGElement>(null);

  const type = useChartStore((s) => s.type);
  const indicators = useChartStore((s) => s.indicators);
  const tool = useChartStore((s) => s.tool);
  const sticky = useChartStore((s) => s.sticky);
  const cursor = useChartStore((s) => s.cursor);
  const drawings = useChartStore((s) => s.history.present);
  const hidden = useChartStore((s) => s.hidden);
  const selected = useChartStore((s) => s.selected);
  const log = useChartStore((s) => s.log);
  const auto = useChartStore((s) => s.auto);
  const replay = useChartStore((s) => s.replay);

  const [hover, setHover] = useState<Hover | null>(null);
  const [manual, setManual] = useState<{ lo: number; hi: number } | null>(null);
  const [step, setStep] = useState(0);
  const [intro, setIntro] = useState(true);
  const [indicatorsOpen, setIndicatorsOpen] = useState(false);
  const shortcutsOpen = useChartStore((s) => s.shortcutsOpen);
  const indicatorsLoaded = useOnceTrue(indicatorsOpen);
  const shortcutsLoaded = useOnceTrue(shortcutsOpen);

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), INTRO_MS);
    return () => clearTimeout(timer);
  }, []);

  // "auto" fits the price scale to the candles again, whatever range was dragged out before
  const dragged = auto ? null : manual;

  const candles = bars.candles;
  const count = candles.length;
  const replaying = replay.phase === 'ready';
  // the playhead of another interval can be past the end for the one render before it is moved
  const limit = replaying ? Math.min(count, replay.at + 1) : count;
  const last = limit - 1;

  // The market ticks while nothing is pointed at; "reduce motion" keeps it still (a timer, so CSS cannot do it). It also waits while
  // the tab is in the background, the chart is scrolled out of view (a phone) or one of its own windows covers it: a re-render
  // every two seconds for nobody.
  const tabHidden = useDocumentHidden();
  const onScreen = useOnScreen(svg);
  const ticking =
    !reduced &&
    hover === null &&
    replay.phase === 'off' &&
    !tabHidden &&
    onScreen &&
    !indicatorsOpen &&
    !shortcutsOpen;
  useEffect(() => {
    if (!ticking) return;
    const timer = setInterval(() => setStep((n) => n + 1), TICK_MS);
    return () => clearInterval(timer);
  }, [ticking]);

  const live = useMemo(() => {
    if (step === 0 || !ticking) return candles;
    return [
      ...candles.slice(0, -1),
      tickCandle(candles[candles.length - 1], step),
    ];
  }, [candles, step, ticking]);
  const shown = useMemo(() => live.slice(0, limit), [live, limit]);
  const series = useMemo(() => seriesFor(type, shown), [type, shown]);
  const data = useMemo(
    () =>
      computeIndicators(
        candles.map((k) => k.c),
        candles.map((k) => k.v),
      ),
    [candles],
  );
  // an indicator with too few bars (a 20 bar average of 7 yearly bars) is not drawn and not listed
  const shownIndicators = useMemo(
    () => availableIndicators(indicators, data),
    [indicators, data],
  );
  const baseline = useMemo(
    () => candles.reduce((sum, k) => sum + k.c, 0) / candles.length,
    [candles],
  );

  const frame = useMemo<Frame>(
    () =>
      buildFrame({
        width,
        height,
        view,
        series,
        axis,
        type,
        indicators: shownIndicators,
        data,
        log,
        toolbar,
        manual: dragged,
      }),
    [
      width,
      height,
      view,
      series,
      axis,
      type,
      shownIndicators,
      data,
      log,
      toolbar,
      dragged,
    ],
  );

  const clearHover = useCallback(() => setHover(null), []);
  const { leaving, fading } = useChartFade({
    type,
    interval,
    shown,
    frame,
    baseline,
    reduced,
    onIntervalChange: clearHover,
  });

  const formats = useMemo(
    () => ({
      date: barLabeler(lang, copy.intervals.quarterDate),
    }),
    [lang, copy.intervals.quarterDate],
  );
  const monthName = useCallback(
    (month: number) => shortMonthName(month, lang),
    [lang],
  );
  const labels = useMemo(
    () => axisLabels(series, frame.start, frame.end, frame.ts.slot, interval),
    [series, frame, interval],
  );

  const gestures = usePointerGestures({
    svg,
    frame,
    candles: shown,
    limits,
    tool,
    chartView,
    setManual,
    setHover,
  });
  useChartShortcuts({ cancel: gestures.cancel });
  const onKeyDown = useChartKeyboard({
    hover,
    setHover,
    last,
    limits,
    chartView,
  });

  const shownIndex = Math.min(last, hover?.index ?? last);
  const candle = series[shownIndex];
  const real = shown[shownIndex];
  // the job of a bar is the one held at the end of it
  const job = jobAt(entries, bars.ends[shownIndex]);
  const latest = jobAt(entries, bars.ends[last]);
  const dateText = formats.date(real.t, interval);
  const jobText = job ? `${job.role} · ${job.company}` : '';
  // the degree in progress at the end of the bar, beside the job
  const studyNow = studyText(degreeAt(studies, bars.ends[shownIndex]));

  const showCross =
    hover !== null &&
    replay.phase !== 'select' &&
    (cursor !== 'arrow' || hover.y === null) &&
    tool !== 'eraser';
  const cross = crosshairInfo(frame, hover?.y ?? null, candle.c);

  const visibleDrawings = hidden
    ? NO_DRAWINGS
    : gestures.dragging
      ? drawings.map((d) =>
          d.id === gestures.dragging?.id ? gestures.dragging : d,
        )
      : drawings;

  const { items, flags, openFlag } = useChartFlags({
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
    words: copy.chart,
    onOpenJob,
    onOpenDegree,
  });
  const said = useReplayAnnouncer(items, replay, interval, copy.replay);

  const label = fill(copy.chart.label, {
    each: copy.intervals[interval].each,
    from: formatMonthAt(candles[0].t, lang),
    to: formatMonthAt(bars.ends[count - 1], lang),
    count,
  });
  const hint = guideText(copy.hints, {
    replay: replay.phase,
    tool,
    started: gestures.draft !== null,
    measuring: gestures.measureBox !== null,
    sticky,
  });
  const touchFree = tool === 'cursor' && replay.phase !== 'select';

  return (
    <>
      <ChartToolbar
        host={host}
        height={toolbar}
        type={type}
        interval={interval}
        replaying={replay.phase !== 'off'}
        onType={chartStore.setType}
        onInterval={chartStore.setInterval}
        onIndicators={() => setIndicatorsOpen(true)}
        onReplay={() =>
          replay.phase === 'off'
            ? chartStore.startReplay()
            : chartStore.exitReplay()
        }
      />
      <ChartSvg
        svg={svg}
        id={id}
        label={label}
        roleLabel={copy.chart.role}
        width={width}
        height={height}
        frame={frame}
        type={type}
        interval={interval}
        tool={tool}
        cursor={cursor}
        touchFree={touchFree}
        handlers={gestures.handlers}
        onKeyDown={onKeyDown}
        onBlur={clearHover}
        reduced={reduced}
        shown={shown}
        series={series}
        baseline={baseline}
        last={last}
        indicators={indicators}
        shownIndicators={shownIndicators}
        data={data}
        labels={labels}
        monthName={monthName}
        leaving={leaving}
        fading={fading}
        hover={hover}
        shownIndex={shownIndex}
        crosshair={
          showCross && hover ? { ...cross, x: frame.ts.x(hover.index) } : null
        }
        dateText={dateText}
        drawings={visibleDrawings}
        draft={gestures.draft}
        selected={selected}
        measureBox={gestures.measureBox}
        replay={replay}
        lastWord={latestWord}
        tick={step}
      />
      <ChartOverlays
        frame={frame}
        interval={interval}
        toolbar={toolbar}
        entries={entries}
        flags={flags}
        intro={intro}
        onOpenFlag={openFlag}
        company={latest?.company ?? ''}
        candle={candle}
        dateText={dateText}
        jobText={jobText}
        studyText={studyNow}
        indicators={shownIndicators}
        data={data}
        index={shownIndex}
        measureBox={gestures.measureBox}
        note={gestures.note}
        onNoteDone={gestures.finishNote}
        hint={hint}
        replay={replay}
        reduced={reduced}
        said={said}
        status={
          hover && hover.y === null
            ? `${dateText}${jobText ? `: ${jobText}` : ''}${studyNow ? `, ${studyNow}` : ''}`
            : ''
        }
      />
      {indicatorsLoaded && (
        <IndicatorsDialog
          open={indicatorsOpen}
          onOpenChange={setIndicatorsOpen}
        />
      )}
      {shortcutsLoaded && (
        <ShortcutsDialog
          open={shortcutsOpen}
          onOpenChange={chartStore.setShortcutsOpen}
        />
      )}
    </>
  );
}
